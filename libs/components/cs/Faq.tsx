import React, { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { FAQ_CATEGORIES, FAQS, FaqCategory } from './csContent';

const Faq = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<FaqCategory | 'ALL'>('ALL');
	const [text, setText] = useState<string>('');
	const [expanded, setExpanded] = useState<string | null>(FAQS[0].id);

	const query = text.trim().toLowerCase();
	const list = useMemo(
		() =>
			FAQS.filter((item) => category === 'ALL' || item.category === category).filter(
				(item) =>
					!query || t(item.question).toLowerCase().includes(query) || t(item.answer).toLowerCase().includes(query),
			),
		[category, query, t],
	);

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	}

	const countOf = (value: FaqCategory) => FAQS.filter((item) => item.category === value).length;

	return (
		<section className={'cs-panel'} id={'faq-section'} aria-label={t('FAQ')}>
			<header className={'panel-head'}>
				<div className={'panel-title'}>
					<span className={'panel-chip'}>
						<span className={'dot'} aria-hidden />
						{t('FAQ')}
					</span>
					<span className={'panel-meta'}>
						{FAQS.length} {t('answers in')} {FAQ_CATEGORIES.length} {t('topics')}
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
					{t('All')} ({FAQS.length})
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
					<p className={'empty-row'}>{t('No questions match this search')}</p>
				) : (
					list.map((item) => {
						const open = expanded === item.id;
						return (
							<div className={`faq-item ${open ? 'open' : ''}`} key={item.id}>
								<button
									type="button"
									className={'faq-question'}
									aria-expanded={open}
									aria-controls={`faq-${item.id}`}
									onClick={() => setExpanded(open ? null : item.id)}
								>
									<span className={'faq-badge'} aria-hidden>
										Q
									</span>
									<span className={'faq-text'}>{t(item.question)}</span>
									<span className={'faq-topic'}>
										{t(FAQ_CATEGORIES.find((cat) => cat.value === item.category)?.label ?? '')}
									</span>
									<KeyboardArrowDownRoundedIcon className={'faq-arrow'} aria-hidden />
								</button>
								{open && (
									<div className={'faq-answer'} id={`faq-${item.id}`}>
										<span className={'faq-badge answer'} aria-hidden>
											A
										</span>
										<p>{t(item.answer)}</p>
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
