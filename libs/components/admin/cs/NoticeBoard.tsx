import React, { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Dialog } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
	AdminPageHeader,
	AdminPager,
	AdminSearch,
	AdminStats,
	AdminTabs,
	EmptyRow,
	StatusMenu,
	Tone,
	useAdminTotal,
} from '../AdminUI';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../../apollo/admin/query';
import { CREATE_NOTICE, REMOVE_NOTICE, UPDATE_NOTICE } from '../../../../apollo/admin/mutation';
import { Notice, NoticeInput } from '../../../types/notice/notice';
import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../../enums/notice.enum';
import { FAQ_CATEGORIES, NOTICE_CATEGORIES, topicLabel } from '../../cs/csContent';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../sweetAlert';

const ROOT = 'getAllNoticesByAdmin';

const STATUS_LABEL: Record<NoticeStatus, string> = {
	[NoticeStatus.ACTIVE]: 'Active',
	[NoticeStatus.HOLD]: 'Hidden',
	[NoticeStatus.DELETE]: 'Deleted',
};
const STATUS_TONE: Record<NoticeStatus, Tone> = {
	[NoticeStatus.ACTIVE]: 'success',
	[NoticeStatus.HOLD]: 'warning',
	[NoticeStatus.DELETE]: 'danger',
};
const TOPIC_TONE: Partial<Record<NoticeTopic, Tone>> = {
	[NoticeTopic.EVENT]: 'warning',
	[NoticeTopic.POLICY]: 'info',
	[NoticeTopic.UPDATE]: 'success',
};

interface BoardText {
	title: string;
	desc: string;
	item: string; // "notice" / "answer"
	publicHref: string;
	titleLabel: string; // "Title" / "Question"
	contentLabel: string; // "Summary" / "Answer"
}

const TEXT: Record<NoticeCategory.NOTICE | NoticeCategory.FAQ, BoardText> = {
	[NoticeCategory.NOTICE]: {
		title: 'Notice Management',
		desc: 'Announcements on the Help center Notice tab: events, policy changes and site updates. Hidden notices stay here until you activate them.',
		item: 'notices',
		publicHref: '/cs?tab=notice',
		titleLabel: 'Title',
		contentLabel: 'Summary',
	},
	[NoticeCategory.FAQ]: {
		title: 'FAQ Management',
		desc: 'Questions and answers shown on the Help center FAQ tab, grouped by topic. Answers keep the order they were added in.',
		item: 'answers',
		publicHref: '/cs?tab=faq',
		titleLabel: 'Question',
		contentLabel: 'Answer',
	},
};

type EditorState = (NoticeInput & { _id?: string }) | null;

// Shared admin board for NOTICE and FAQ entries (both live in the notices collection)
const NoticeBoard = ({ category }: { category: NoticeCategory.NOTICE | NoticeCategory.FAQ }) => {
	const client = useApolloClient();
	const text = TEXT[category];
	const topics = category === NoticeCategory.NOTICE ? NOTICE_CATEGORIES : FAQ_CATEGORIES;
	const [status, setStatus] = useState<string>('ALL');
	const [searchText, setSearchText] = useState<string>('');
	const [query, setQuery] = useState<string>('');
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const [editor, setEditor] = useState<EditorState>(null);

	/** APOLLO REQUESTS **/
	const search = { noticeCategory: category, ...(status !== 'ALL' && { noticeStatus: status }), ...(query && { text: query }) };
	const { data, loading } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit, sort: 'createdAt', search } },
	});
	const rows: Notice[] = data?.[ROOT]?.list ?? [];
	const total: number = data?.[ROOT]?.metaCounter?.[0]?.total ?? 0;
	const totals = {
		all: useAdminTotal(GET_ALL_NOTICES_BY_ADMIN, ROOT, { noticeCategory: category }),
		active: useAdminTotal(GET_ALL_NOTICES_BY_ADMIN, ROOT, { noticeCategory: category, noticeStatus: NoticeStatus.ACTIVE }),
		hold: useAdminTotal(GET_ALL_NOTICES_BY_ADMIN, ROOT, { noticeCategory: category, noticeStatus: NoticeStatus.HOLD }),
		delete: useAdminTotal(GET_ALL_NOTICES_BY_ADMIN, ROOT, { noticeCategory: category, noticeStatus: NoticeStatus.DELETE }),
	};
	const [createNotice, { loading: creating }] = useMutation(CREATE_NOTICE);
	const [updateNotice, { loading: updating }] = useMutation(UPDATE_NOTICE);
	const [removeNotice] = useMutation(REMOVE_NOTICE);

	/** HANDLERS **/
	const refresh = () => client.refetchQueries({ include: [GET_ALL_NOTICES_BY_ADMIN] });

	const statusHandler = async (id: string, noticeStatus: NoticeStatus) => {
		try {
			await updateNotice({ variables: { input: { _id: id, noticeStatus } } });
			await refresh();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// The API removes only entries that are already in DELETE status
	const removeHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove this entry for good?'))) return;
			await removeNotice({ variables: { input: id } });
			await refresh();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const saveHandler = async () => {
		if (!editor) return;
		const { _id, ...fields } = editor;
		const input = {
			...fields,
			noticeTitle: fields.noticeTitle.trim(),
			noticeContent: fields.noticeContent.trim(),
			noticeTeam: fields.noticeTeam?.trim() || undefined,
			noticeLink: fields.noticeLink?.trim() ?? '',
		};
		try {
			if (_id) await updateNotice({ variables: { input: { _id, ...input } } });
			// A new entry without a link simply leaves the field out
			else await createNotice({ variables: { input: { ...input, noticeLink: input.noticeLink || undefined } } });
			setEditor(null);
			await refresh();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const openNew = () =>
		setEditor({
			noticeCategory: category,
			noticeTopic: topics[0].value,
			noticeStatus: NoticeStatus.ACTIVE,
			noticeTitle: '',
			noticeContent: '',
			noticeTeam: category === NoticeCategory.FAQ ? 'Customer Care' : 'Navano Team',
			noticeLink: '',
		});

	const openEdit = (row: Notice) =>
		setEditor({
			_id: row._id,
			noticeCategory: row.noticeCategory,
			noticeTopic: row.noticeTopic,
			noticeStatus: row.noticeStatus,
			noticeTitle: row.noticeTitle,
			noticeContent: row.noticeContent,
			noticeTeam: row.noticeTeam ?? '',
			noticeLink: row.noticeLink ?? '',
		});

	const titleOk = !!editor && editor.noticeTitle.trim().length >= 3 && editor.noticeTitle.trim().length <= 150;
	const contentOk = !!editor && editor.noticeContent.trim().length >= 3 && editor.noticeContent.trim().length <= 3000;
	const linkOk = !editor?.noticeLink || /^\/\S*$/.test(editor.noticeLink.trim());
	const canSave = titleOk && contentOk && linkOk && !creating && !updating;

	return (
		<>
			<AdminPageHeader
				title={text.title}
				tag={`${totals.all} ${text.item}`}
				desc={text.desc}
				actions={
					<>
						<Link href={text.publicHref} target={'_blank'} className={'admin-btn ghost'}>
							<OpenInNewIcon aria-hidden />
							Open the public page
						</Link>
						<button type="button" className={'admin-btn primary'} onClick={openNew}>
							<AddRoundedIcon aria-hidden />
							{category === NoticeCategory.FAQ ? 'New question' : 'New notice'}
						</button>
					</>
				}
			/>

			<AdminStats
				items={[
					{ label: 'Total', value: totals.all, note: `All ${text.item}`, icon: <EditOutlinedIcon /> },
					{ label: 'Active', value: totals.active, note: 'Shown on the Help center', icon: <TaskAltOutlinedIcon />, tone: 'success' },
					{ label: 'Hidden', value: totals.hold, note: 'Saved but not shown', icon: <PauseCircleOutlineIcon />, tone: 'warning' },
					{ label: 'Deleted', value: totals.delete, note: 'Can be removed for good', icon: <DeleteOutlineIcon />, tone: 'danger' },
				]}
			/>

			<AdminTabs
				value={status}
				onChange={(value) => {
					setStatus(value);
					setPage(1);
				}}
				tabs={[
					{ value: 'ALL', label: 'All', count: totals.all },
					{ value: NoticeStatus.ACTIVE, label: 'Active', count: totals.active },
					{ value: NoticeStatus.HOLD, label: 'Hidden', count: totals.hold },
					{ value: NoticeStatus.DELETE, label: 'Deleted', count: totals.delete },
				]}
			/>

			<div className={'admin-filters'}>
				<AdminSearch
					value={searchText}
					placeholder={'Search titles'}
					onChange={setSearchText}
					onSubmit={() => {
						setQuery(searchText.trim());
						setPage(1);
					}}
					onClear={() => {
						setSearchText('');
						setQuery('');
						setPage(1);
					}}
				/>
			</div>

			<div className={'admin-table-card'}>
				<div className={'admin-table-scroll'}>
					<table className={'admin-table'}>
						<thead>
							<tr>
								<th>Topic</th>
								<th>{text.titleLabel}</th>
								<th>Team</th>
								<th>Updated</th>
								<th className={'center'}>Status</th>
								<th className={'center'}>Edit</th>
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 && <EmptyRow colSpan={6} text={loading ? 'Loading…' : `No ${text.item} match this view`} />}
							{rows.map((row) => (
								<tr key={row._id}>
									<td>
										<span className={`status-pill tone-${TOPIC_TONE[row.noticeTopic] ?? 'neutral'}`}>
											<span className={'dot'} aria-hidden />
											{topicLabel(row.noticeTopic)}
										</span>
									</td>
									<td className={'wide'}>
										<span className={'cell-stack'}>
											{row.noticeLink ? (
												<Link href={row.noticeLink} target={'_blank'} className={'cell-link'}>
													{row.noticeTitle}
												</Link>
											) : (
												<strong>{row.noticeTitle}</strong>
											)}
											<small className={'clamp'}>{row.noticeContent}</small>
										</span>
									</td>
									<td>{row.noticeTeam ?? '—'}</td>
									<td className={'mono'}>{moment(row.updatedAt).format('YYYY.MM.DD')}</td>
									<td className={'center'}>
										<span className={'cell-actions'}>
											<StatusMenu
												label={STATUS_LABEL[row.noticeStatus]}
												tone={STATUS_TONE[row.noticeStatus]}
												options={Object.values(NoticeStatus)
													.filter((value) => value !== row.noticeStatus)
													.map((value) => ({ value, label: STATUS_LABEL[value] }))}
												onSelect={(value) => statusHandler(row._id, value as NoticeStatus)}
											/>
											{row.noticeStatus === NoticeStatus.DELETE && (
												<button
													type="button"
													className={'icon-btn danger'}
													aria-label={'Remove for good'}
													title={'Remove for good'}
													onClick={() => removeHandler(row._id)}
												>
													<DeleteForeverOutlinedIcon />
												</button>
											)}
										</span>
									</td>
									<td className={'center'}>
										<button type="button" className={'icon-btn'} aria-label={'Edit'} title={'Edit'} onClick={() => openEdit(row)}>
											<EditOutlinedIcon />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<AdminPager
					total={total}
					page={page}
					limit={limit}
					onPage={setPage}
					onLimit={(next) => {
						setLimit(next);
						setPage(1);
					}}
				/>
			</div>

			<Dialog
				open={!!editor}
				onClose={() => setEditor(null)}
				fullWidth
				maxWidth={'sm'}
				PaperProps={{ className: 'admin-dialog-paper' }}
				aria-labelledby={'notice-editor-title'}
			>
				{editor && (
					<form
						className={'admin-dialog'}
						onSubmit={(e) => {
							e.preventDefault();
							if (canSave) saveHandler();
						}}
					>
						<h2 id={'notice-editor-title'}>
							{editor._id ? 'Edit' : 'New'} {category === NoticeCategory.FAQ ? 'question' : 'notice'}
						</h2>
						<div className={'dialog-row'}>
							<label>
								<span>Topic</span>
								<select
									value={editor.noticeTopic}
									onChange={(e) => setEditor({ ...editor, noticeTopic: e.target.value as NoticeTopic })}
								>
									{topics.map((topic) => (
										<option key={topic.value} value={topic.value}>
											{topic.label}
										</option>
									))}
									<option value={NoticeTopic.GENERAL}>General</option>
								</select>
							</label>
							<label>
								<span>Status</span>
								<select
									value={editor.noticeStatus}
									onChange={(e) => setEditor({ ...editor, noticeStatus: e.target.value as NoticeStatus })}
								>
									{Object.values(NoticeStatus).map((value) => (
										<option key={value} value={value}>
											{STATUS_LABEL[value]}
										</option>
									))}
								</select>
							</label>
						</div>
						<label>
							<span>
								{text.titleLabel} <small>{editor.noticeTitle.trim().length}/150</small>
							</span>
							<input
								type="text"
								value={editor.noticeTitle}
								maxLength={150}
								onChange={(e) => setEditor({ ...editor, noticeTitle: e.target.value })}
								autoFocus
							/>
						</label>
						<label>
							<span>
								{text.contentLabel} <small>{editor.noticeContent.trim().length}/3000</small>
							</span>
							<textarea
								rows={6}
								value={editor.noticeContent}
								maxLength={3000}
								onChange={(e) => setEditor({ ...editor, noticeContent: e.target.value })}
							/>
						</label>
						<div className={'dialog-row'}>
							<label>
								<span>Team</span>
								<input
									type="text"
									value={editor.noticeTeam ?? ''}
									maxLength={50}
									onChange={(e) => setEditor({ ...editor, noticeTeam: e.target.value })}
								/>
							</label>
							<label>
								<span>Link (optional)</span>
								<input
									type="text"
									value={editor.noticeLink ?? ''}
									placeholder={'/product'}
									aria-invalid={!linkOk}
									onChange={(e) => setEditor({ ...editor, noticeLink: e.target.value })}
								/>
								{!linkOk && <small className={'field-error'}>Use a page on this site, starting with /</small>}
							</label>
						</div>
						<p className={'dialog-hint'}>Texts are shown as written. Seeded texts also have Korean and Russian translations.</p>
						<div className={'dialog-actions'}>
							<button type="button" className={'admin-btn ghost'} onClick={() => setEditor(null)}>
								Cancel
							</button>
							<button type="submit" className={'admin-btn primary'} disabled={!canSave}>
								{creating || updating ? 'Saving…' : 'Save'}
							</button>
						</div>
					</form>
				)}
			</Dialog>
		</>
	);
};

export default NoticeBoard;
