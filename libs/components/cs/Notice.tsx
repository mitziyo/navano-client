import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { NOTICE_CATEGORIES, NOTICES, NoticeCategory } from './csContent';

const PAGE_SIZE = 4;

const Notice = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<NoticeCategory | 'ALL'>('ALL');
	const [text, setText] = useState<string>('');
	const [page, setPage] = useState<number>(1);

	const query = text.trim().toLowerCase();
	const list = useMemo(
		() =>
			NOTICES.filter((item) => category === 'ALL' || item.category === category).filter(
				(item) =>
					!query ||
					t(item.title).toLowerCase().includes(query) ||
					t(item.summary).toLowerCase().includes(query),
			),
		[category, query, t],
	);

	/** HANDLERS **/
	const categoryHandler = (value: NoticeCategory | 'ALL') => {
		setCategory(value);
		setPage(1);
	};

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	}

	const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
	const current = Math.min(page, pageCount);
	const rows = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
	const from = list.length ? (current - 1) * PAGE_SIZE + 1 : 0;
	const to = Math.min(list.length, current * PAGE_SIZE);
	const countOf = (value: NoticeCategory) => NOTICES.filter((item) => item.category === value).length;

	return (
		<section className={'cs-panel'} id={'notice-section'} aria-label={t('Notice')}>
			<header className={'panel-head'}>
				<div className={'panel-title'}>
					<span className={'panel-chip'}>
						<span className={'dot'} aria-hidden />
						{t('Notice')}
					</span>
					<span className={'panel-meta'}>
						{t('Total')} {NOTICES.length} {t('notices')}
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
					{t('All')} ({NOTICES.length})
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
								{t('No notices match this search')}
							</td>
						</tr>
					) : (
						rows.map((item) => (
							<tr key={item.id} className={item.category === 'EVENT' ? 'is-event' : ''}>
								<td className={'col-no'}>{String(item.id).padStart(2, '0')}</td>
								<td>
									<div className={'notice-cell'}>
										<span className={`notice-tag tag-${item.category.toLowerCase()}`}>{t(item.category)}</span>
										<div>
											{item.href ? (
												<Link href={item.href} className={'notice-title'}>
													{t(item.title)}
													<ArrowForwardIcon aria-hidden />
												</Link>
											) : (
												<strong className={'notice-title'}>{t(item.title)}</strong>
											)}
											<p>{t(item.summary)}</p>
										</div>
									</div>
								</td>
								<td className={'col-team'}>{t(item.team)}</td>
								<td className={'col-date'}>
									<time dateTime={item.date}>{moment(item.date).format('DD.MM.YYYY')}</time>
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
