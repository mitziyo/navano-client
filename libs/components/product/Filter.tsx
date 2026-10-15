import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ProductLocation, ProductOccasion, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { FacetCount, ProductFacets } from '../../types/product/product';
import { toLabel } from '../homepage/productLabels';

export const DEFAULT_PRICE_RANGE = { start: 0, end: 2000000 };

type Search = ProductsInquiry['search'];
type ListKey = 'locationList' | 'typeList' | 'occasionList';

interface FilterProps {
	searchFilter: ProductsInquiry;
	facets?: ProductFacets;
	onApply: (search: Search) => void;
	onReset: () => void;
}

const countOf = (list: FacetCount[] | undefined, value: string) => list?.find((item) => item.value === value)?.count ?? 0;

const Filter = (props: FilterProps) => {
	const { searchFilter, facets, onApply, onReset } = props;
	const { t } = useTranslation('common');
	// Edits stay in a draft until "Apply filters"
	const [draft, setDraft] = useState<Search>(searchFilter.search);

	/** LIFECYCLES **/
	useEffect(() => {
		setDraft(searchFilter.search);
	}, [searchFilter]);

	/** HANDLERS **/
	const toggleValue = (key: ListKey, value: string) => {
		setDraft((prev) => {
			const current: string[] = (prev[key] as string[] | undefined) ?? [];
			const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
			const search: any = { ...prev, [key]: next };
			if (!next.length) delete search[key];
			return search;
		});
	};

	const priceHandler = (edge: 'start' | 'end', value: string) => {
		setDraft((prev) => {
			const current = prev.pricesRange ?? DEFAULT_PRICE_RANGE;
			const parsed = value === '' ? DEFAULT_PRICE_RANGE[edge] : Math.max(0, Number(value));
			return { ...prev, pricesRange: { ...current, [edge]: parsed } };
		});
	};

	const applyHandler = () => {
		const search: any = { ...draft };
		if (!search.text?.trim()) delete search.text;
		onApply(search);
	};

	const renderGroup = (title: string, hint: string, key: ListKey, values: string[], counts?: FacetCount[]) => (
		<fieldset className={'filter-group'}>
			<legend>
				<span>{t(title)}</span>
				<small>{t(hint)}</small>
			</legend>
			{values.map((value) => {
				const checked = Boolean((draft[key] as string[] | undefined)?.includes(value));
				return (
					<label key={value} className={`filter-option ${checked ? 'checked' : ''}`}>
						<input type="checkbox" checked={checked} onChange={() => toggleValue(key, value)} />
						<span className={'check'} aria-hidden>
							{checked && <CheckIcon />}
						</span>
						<span className={'option-label'}>{t(toLabel(value))}</span>
						<span className={'option-count'}>{countOf(counts, value)}</span>
					</label>
				);
			})}
		</fieldset>
	);

	const price = draft.pricesRange ?? DEFAULT_PRICE_RANGE;

	return (
		<div className={'filter-panel'}>
			<section className={'filter-card'}>
				<h2 className={'filter-title'}>{t('Find your product')}</h2>
				<div className={'filter-search'}>
					<SearchIcon aria-hidden />
					<input
						type="text"
						value={draft.text ?? ''}
						placeholder={t('What are you looking for?')}
						aria-label={t('Search products')}
						onChange={(e) => setDraft((prev) => ({ ...prev, text: e.target.value }))}
						onKeyDown={(e) => e.key === 'Enter' && applyHandler()}
					/>
					{draft.text && (
						<button
							type="button"
							aria-label={t('Clear search')}
							onClick={() => setDraft((prev) => ({ ...prev, text: '' }))}
						>
							<CloseIcon />
						</button>
					)}
				</div>

				{renderGroup('Location', 'Cities', 'locationList', Object.values(ProductLocation), facets?.locations)}
				{renderGroup('Product type', 'Categories', 'typeList', Object.values(ProductType), facets?.types)}
				{renderGroup('Occasion', 'Moments', 'occasionList', Object.values(ProductOccasion), facets?.occasions)}

				<fieldset className={'filter-group'}>
					<legend>
						<span>{t('Price range')}</span>
						<small>USD</small>
					</legend>
					<div className={'price-inputs'}>
						<label>
							<span>$</span>
							<input
								type="number"
								min={0}
								value={price.start}
								aria-label={t('Minimum price')}
								onChange={(e) => priceHandler('start', e.target.value)}
							/>
						</label>
						<span className={'dash'} aria-hidden>
							–
						</span>
						<label>
							<span>$</span>
							<input
								type="number"
								min={0}
								// The default upper bound means "no limit", so the field stays empty
								value={price.end === DEFAULT_PRICE_RANGE.end ? '' : price.end}
								placeholder={t('Any')}
								aria-label={t('Maximum price')}
								onChange={(e) => priceHandler('end', e.target.value)}
							/>
						</label>
					</div>
				</fieldset>

				<div className={'filter-actions'}>
					<button type="button" className={'apply-btn'} onClick={applyHandler}>
						<CheckIcon />
						<span>{t('Apply filters')}</span>
					</button>
					<button type="button" className={'reset-btn'} onClick={onReset}>
						{t('Reset criteria')}
					</button>
				</div>
			</section>

			<aside className={'concierge-card'}>
				<span className={'concierge-eyebrow'}>{t('Need something special?')}</span>
				<h3>{t('Custom orders')}</h3>
				<p>{t('Ask a store for a custom cake, a seasonal bouquet or a gift box for a big event')}</p>
				<Link href={'/cs?tab=faq'} className={'concierge-link'}>
					<span>{t('Contact support')}</span>
					<ArrowForwardIcon />
				</Link>
			</aside>
		</div>
	);
};

export default Filter;
