import React, { useState } from 'react';
import type { NextPage } from 'next';
import moment from 'moment';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Dialog } from '@mui/material';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	AdminPageHeader,
	AdminPager,
	AdminSelect,
	AdminStats,
	AdminTabs,
	EmptyRow,
	StatusPill,
	shortId,
	useAdminTotal,
} from '../../../libs/components/admin/AdminUI';
import { GET_ALL_INQUIRIES_BY_ADMIN } from '../../../apollo/admin/query';
import { ANSWER_INQUIRY_BY_ADMIN } from '../../../apollo/admin/mutation';
import { Inquiry } from '../../../libs/types/inquiry/inquiry';
import { InquiryStatus, InquiryType } from '../../../libs/enums/inquiry.enum';
import { INQUIRY_TYPES } from '../../../libs/components/cs/csContent';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { REACT_APP_API_URL } from '../../../libs/config';

const ROOT = 'getAllInquiriesByAdmin';
const typeLabel = (type: InquiryType) => INQUIRY_TYPES.find((item) => item.value === type)?.label ?? type;
const TYPE_OPTIONS = [
	{ value: 'ALL', label: 'All topics' },
	...INQUIRY_TYPES.map((item) => ({ value: item.value, label: item.label })),
];

// 1:1 inquiry inbox: members' private questions, answered here and shown on their CS page
const AdminInquiry: NextPage = () => {
	const client = useApolloClient();
	const [status, setStatus] = useState<string>(InquiryStatus.WAIT);
	const [type, setType] = useState<string>('ALL');
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const [selected, setSelected] = useState<Inquiry | null>(null);
	const [answer, setAnswer] = useState<string>('');

	/** APOLLO REQUESTS **/
	const search = { ...(status !== 'ALL' && { inquiryStatus: status }), ...(type !== 'ALL' && { inquiryType: type }) };
	const { data, loading } = useQuery(GET_ALL_INQUIRIES_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit, search } },
	});
	const rows: Inquiry[] = data?.[ROOT]?.list ?? [];
	const total: number = data?.[ROOT]?.metaCounter?.[0]?.total ?? 0;
	const totals = {
		all: useAdminTotal(GET_ALL_INQUIRIES_BY_ADMIN, ROOT, {}),
		wait: useAdminTotal(GET_ALL_INQUIRIES_BY_ADMIN, ROOT, { inquiryStatus: InquiryStatus.WAIT }),
		answered: useAdminTotal(GET_ALL_INQUIRIES_BY_ADMIN, ROOT, { inquiryStatus: InquiryStatus.ANSWERED }),
	};
	const [answerInquiry, { loading: saving }] = useMutation(ANSWER_INQUIRY_BY_ADMIN);

	/** HANDLERS **/
	const open = (row: Inquiry) => {
		setSelected(row);
		setAnswer(row.inquiryAnswer ?? '');
	};

	const answerHandler = async () => {
		if (!selected || answer.trim().length < 2) return;
		try {
			await answerInquiry({ variables: { input: { _id: selected._id, inquiryAnswer: answer.trim() } } });
			setSelected(null);
			await client.refetchQueries({ include: [GET_ALL_INQUIRIES_BY_ADMIN] });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const avatar = (image?: string) => (image ? `${REACT_APP_API_URL}/${image}` : '/img/profile/defaultUser.svg');

	return (
		<>
			<AdminPageHeader
				title={'1:1 Inquiry'}
				tag={`${totals.wait} waiting`}
				desc={
					'Private questions from buyers and stores. Answers appear on the member’s Help center page under 1:1 Inquiry.'
				}
			/>

			<AdminStats
				items={[
					{
						label: 'All inquiries',
						value: totals.all,
						note: 'Withdrawn ones are not counted',
						icon: <ForumOutlinedIcon />,
					},
					{
						label: 'Waiting',
						value: totals.wait,
						note: 'Need an answer',
						icon: <MarkEmailUnreadOutlinedIcon />,
						tone: 'warning',
					},
					{
						label: 'Answered',
						value: totals.answered,
						note: 'Visible to the member',
						icon: <MarkEmailReadOutlinedIcon />,
						tone: 'success',
					},
				]}
			/>

			<AdminTabs
				value={status}
				onChange={(value) => {
					setStatus(value);
					setPage(1);
				}}
				tabs={[
					{ value: InquiryStatus.WAIT, label: 'Waiting', count: totals.wait },
					{ value: InquiryStatus.ANSWERED, label: 'Answered', count: totals.answered },
					{ value: 'ALL', label: 'All', count: totals.all },
				]}
			/>

			<div className={'admin-filters'}>
				<AdminSelect
					label={'Topic'}
					value={type}
					options={TYPE_OPTIONS}
					onChange={(value) => {
						setType(value);
						setPage(1);
					}}
				/>
			</div>

			<div className={'admin-table-card'}>
				<div className={'admin-table-scroll'}>
					<table className={'admin-table'}>
						<thead>
							<tr>
								<th>Member</th>
								<th>Topic</th>
								<th>Question</th>
								<th>Sent</th>
								<th className={'center'}>Status</th>
								<th className={'center'}>Answer</th>
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 && <EmptyRow colSpan={6} text={loading ? 'Loading…' : 'No inquiries here'} />}
							{rows.map((row) => (
								<tr key={row._id}>
									<td>
										<span className={'cell-identity'}>
											<img src={avatar(row.memberData?.memberImage)} alt="" />
											<span>
												<strong>{row.memberData?.memberNick ?? 'Unknown'}</strong>
												<small>{shortId(row.memberId)}</small>
											</span>
										</span>
									</td>
									<td>{typeLabel(row.inquiryType)}</td>
									<td className={'wide'}>
										<span className={'cell-stack'}>
											<strong>{row.inquiryTitle}</strong>
											<small className={'clamp'}>{row.inquiryContent}</small>
										</span>
									</td>
									<td className={'mono'}>{moment(row.createdAt).format('YYYY.MM.DD HH:mm')}</td>
									<td className={'center'}>
										{row.inquiryStatus === InquiryStatus.ANSWERED ? (
											<StatusPill label={'Answered'} tone={'success'} />
										) : (
											<StatusPill label={'Waiting'} tone={'warning'} />
										)}
									</td>
									<td className={'center'}>
										<button type="button" className={'admin-btn ghost small'} onClick={() => open(row)}>
											<ReplyRoundedIcon aria-hidden />
											{row.inquiryStatus === InquiryStatus.ANSWERED ? 'Edit' : 'Answer'}
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
				open={!!selected}
				onClose={() => setSelected(null)}
				fullWidth
				maxWidth={'sm'}
				PaperProps={{ className: 'admin-dialog-paper' }}
				aria-labelledby={'inquiry-answer-title'}
			>
				{selected && (
					<form
						className={'admin-dialog'}
						onSubmit={(e) => {
							e.preventDefault();
							answerHandler();
						}}
					>
						<h2 id={'inquiry-answer-title'}>{selected.inquiryTitle}</h2>
						<p className={'dialog-meta'}>
							{selected.memberData?.memberNick ?? 'Unknown'} · {typeLabel(selected.inquiryType)} ·{' '}
							{moment(selected.createdAt).format('YYYY.MM.DD HH:mm')}
						</p>
						<blockquote className={'dialog-quote'}>{selected.inquiryContent}</blockquote>
						<label>
							<span>
								Answer <small>{answer.trim().length}/3000</small>
							</span>
							<textarea
								rows={6}
								value={answer}
								maxLength={3000}
								onChange={(e) => setAnswer(e.target.value)}
								autoFocus
							/>
						</label>
						<div className={'dialog-actions'}>
							<button type="button" className={'admin-btn ghost'} onClick={() => setSelected(null)}>
								Cancel
							</button>
							<button type="submit" className={'admin-btn primary'} disabled={answer.trim().length < 2 || saving}>
								{saving ? 'Sending…' : 'Send answer'}
							</button>
						</div>
					</form>
				)}
			</Dialog>
		</>
	);
};

export default withAdminLayout(AdminInquiry);
