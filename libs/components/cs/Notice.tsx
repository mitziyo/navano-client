import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { NOTICE_CATEGORIES } from './csContent';
import { Notice as NoticeItem } from '../../types/notice/notice';
import { NoticeTopic } from '../../enums/notice.enum';

const PAGE_SIZE = 4;

interface NoticeProps {
	notices: NoticeItem[];
	loading: boolean;
}

// Notice board; the list comes from getNotices (NOTICE category), newest first
const Notice = ({ notices, loading }: NoticeProps) => {
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<NoticeTopic | 'ALL'>('ALL');
	const [text, setText] = useState<string>('');
	const [page, setPage] = useState<number>(1);

	const query = text.trim().toLowerCase();
	const list = useMemo(
		() =>
			notices
				// Board numbers count down from the newest notice
				.map((item, index) => ({ ...item, no: notices.length - index }))
				.filter((item) => category === 'ALL' || item.noticeTopic === category)
				.filter(
					(item) =>
						!query ||
						t(item.noticeTitle).toLowerCase().includes(query) ||
						t(item.noticeContent).toLowerCase().includes(query),
				),
		[notices, category, query, t],
	);

	/** HANDLERS **/
	const categoryHandler = (value: NoticeTopic | 'ALL') => {
		setCategory(value);
		setPage(1);
	};

	const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
	const current = Math.min(page, pageCount);
	const rows = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
	const from = list.length ? (current - 1) * PAGE_SIZE + 1 : 0;
	const to = Math.min(list.length, current * PAGE_SIZE);
	const countOf = (value: NoticeTopic) => notices.filter((item) => item.noticeTopic === value).length;

	return (
		<section className={'cs-panel'} id={'notice-section'} aria-label={t('Notice')}>
			<header className={'panel-head'}>
				<div className={'panel-title'}>
					<span className={'panel-chip'}>
						<span className={'dot'} aria-hidden />
						{t('Notice')}
					</span>
					<span className={'panel-meta'}>
						{t('Total')} {notices.length} {t('notices')}
					</span>
				</div>
				<label className={'panel-search'}>
					<SearchIcon aria-hidden />
					<input
						type="search"
						value={text}
						placeholder={t('Search notices')}
						aria-label={t('Search notices')}
						onChange={(e) => {
							setText(e.target.value);
							setPage(1);
						}}
					/>
				</label>
			</header>
			<div className={'panel-chips'} role={'group'} aria-label={t('Category')}>
				<button
					type="button"
					className={category === 'ALL' ? 'active' : ''}
					aria-pressed={category === 'ALL'}
					onClick={() => categoryHandler('ALL')}
				>
					{t('All')} ({notices.length})
				</button>
				{NOTICE_CATEGORIES.map((item) => (
					<button
						type="button"
						key={item.value}
						className={category === item.value ? 'active' : ''}
						aria-pressed={category === item.value}
						onClick={() => categoryHandler(item.value)}
					>
						{t(item.label)} ({countOf(item.value)})
					</button>
				))}
			</div>

			<table className={'notice-table'}>
				<thead>
					<tr>
						<th className={'col-no'}>{t('No.')}</th>
						<th>{t('Notice')}</th>
						<th className={'col-team'}>{t('Team')}</th>
						<th className={'col-date'}>{t('Date')}</th>
					</tr>
				</thead>
				<tbody>
					{rows.length === 0 ? (
						<tr>
							<td colSpan={4} className={'empty-row'}>
								{loading ? t('Loading...') : t('No notices match this search')}
							</td>
						</tr>
					) : (
						rows.map((item) => (
							<tr key={item._id} className={item.noticeTopic === NoticeTopic.EVENT ? 'is-event' : ''}>
								<td className={'col-no'}>{String(item.no).padStart(2, '0')}</td>
								<td>
									<div className={'notice-cell'}>
										<span className={`notice-tag tag-${item.noticeTopic.toLowerCase()}`}>{t(item.noticeTopic)}</span>
										<div>
											{item.noticeLink ? (
												<Link href={item.noticeLink} className={'notice-title'}>
													{t(item.noticeTitle)}
													<ArrowForwardIcon aria-hidden />
												</Link>
											) : (
												<strong className={'notice-title'}>{t(item.noticeTitle)}</strong>
											)}
											<p>{t(item.noticeContent)}</p>
										</div>
									</div>
								</td>
								<td className={'col-team'}>{t(item.noticeTeam ?? 'Navano Team')}</td>
								<td className={'col-date'}>
									<time dateTime={moment(item.createdAt).format('YYYY-MM-DD')}>{moment(item.createdAt).format('DD.MM.YYYY')}</time>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>

			<footer className={'panel-foot'}>
				<span>
					{t('Showing')} {from}–{to} {t('of')} {list.length}
				</span>
				<nav className={'pager'} aria-label={t('Pages')}>
					<button
						type="button"
						aria-label={t('Previous page')}
						disabled={current === 1}
						onClick={() => setPage(current - 1)}
					>
						<ChevronLeftIcon />
					</button>
					{Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => (
						<button
							type="button"
							key={value}
							className={value === current ? 'active' : ''}
							aria-current={value === current ? 'page' : undefined}
							onClick={() => setPage(value)}
						>
							{value}
						</button>
					))}
					<button
						type="button"
						aria-label={t('Next page')}
						disabled={current === pageCount}
						onClick={() => setPage(current + 1)}
					>
						<ChevronRightIcon />
					</button>
				</nav>
			</footer>
		</section>
	);
};

export default Notice;
