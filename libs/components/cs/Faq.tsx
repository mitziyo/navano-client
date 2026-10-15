import React, { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { FAQ_CATEGORIES } from './csContent';
import { Notice as FaqItem } from '../../types/notice/notice';
import { NoticeTopic } from '../../enums/notice.enum';

interface FaqProps {
	faqs: FaqItem[];
	loading: boolean;
}

// FAQ accordion; questions are FAQ-category notices (title = question, content = answer)
const Faq = ({ faqs, loading }: FaqProps) => {
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<NoticeTopic | 'ALL'>('ALL');
	const [text, setText] = useState<string>('');
	// undefined = the first question is open until the visitor picks one
	const [expanded, setExpanded] = useState<string | null | undefined>(undefined);

	const query = text.trim().toLowerCase();
	const list = useMemo(
		() =>
			faqs
				.filter((item) => category === 'ALL' || item.noticeTopic === category)
				.filter(
					(item) =>
						!query ||
						t(item.noticeTitle).toLowerCase().includes(query) ||
						t(item.noticeContent).toLowerCase().includes(query),
				),
		[faqs, category, query, t],
	);

	const countOf = (value: NoticeTopic) => faqs.filter((item) => item.noticeTopic === value).length;
	const openId = expanded === undefined ? faqs[0]?._id ?? null : expanded;

	return (
		<section className={'cs-panel'} id={'faq-section'} aria-label={t('FAQ')}>
			<header className={'panel-head'}>
				<div className={'panel-title'}>
					<span className={'panel-chip'}>
						<span className={'dot'} aria-hidden />
						{t('FAQ')}
					</span>
					<span className={'panel-meta'}>
						{faqs.length} {t('answers in')} {FAQ_CATEGORIES.length} {t('topics')}
					</span>
				</div>
				<label className={'panel-search'}>
					<SearchIcon aria-hidden />
					<input
						type="search"
						value={text}
						placeholder={t('Search questions')}
						aria-label={t('Search questions')}
						onChange={(e) => setText(e.target.value)}
					/>
				</label>
			</header>
			<div className={'panel-chips'} role={'group'} aria-label={t('Category')}>
				<button
					type="button"
					className={category === 'ALL' ? 'active' : ''}
					aria-pressed={category === 'ALL'}
					onClick={() => setCategory('ALL')}
				>
					{t('All')} ({faqs.length})
				</button>
				{FAQ_CATEGORIES.map((item) => (
					<button
						type="button"
						key={item.value}
						className={category === item.value ? 'active' : ''}
						aria-pressed={category === item.value}
						onClick={() => setCategory(item.value)}
					>
						{t(item.label)} ({countOf(item.value)})
					</button>
				))}
			</div>

			<div className={'faq-list'}>
				{list.length === 0 ? (
					<p className={'empty-row'}>{loading ? t('Loading...') : t('No questions match this search')}</p>
				) : (
					list.map((item) => {
						const open = openId === item._id;
						return (
							<div className={`faq-item ${open ? 'open' : ''}`} key={item._id}>
								<button
									type="button"
									className={'faq-question'}
									aria-expanded={open}
									aria-controls={`faq-${item._id}`}
									onClick={() => setExpanded(open ? null : item._id)}
								>
									<span className={'faq-badge'} aria-hidden>
										Q
									</span>
									<span className={'faq-text'}>{t(item.noticeTitle)}</span>
									<span className={'faq-topic'}>
										{t(FAQ_CATEGORIES.find((cat) => cat.value === item.noticeTopic)?.label ?? 'General')}
									</span>
									<KeyboardArrowDownRoundedIcon className={'faq-arrow'} aria-hidden />
								</button>
								{open && (
									<div className={'faq-answer'} id={`faq-${item._id}`}>
										<span className={'faq-badge answer'} aria-hidden>
											A
										</span>
										<p>{t(item.noticeContent)}</p>
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
		</section>
	);
};

export default Faq;
