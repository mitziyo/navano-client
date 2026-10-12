import React, { MouseEvent, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Menu, MenuItem, Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useMutation, useQuery } from '@apollo/client';
import ProductCard from '../../libs/components/product/ProductCard';
import Filter, { DEFAULT_PRICE_RANGE } from '../../libs/components/product/Filter';
import { CardSkeletons } from '../../libs/components/homepage/SectionState';
import { toLabel } from '../../libs/components/homepage/productLabels';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product, ProductFacets } from '../../libs/types/product/product';
import { Direction, Message } from '../../libs/enums/common.enum';
import { GET_AGENTS, GET_PRODUCT_FACETS, GET_PRODUCTS } from '../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const DEFAULT_INPUT: ProductsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { pricesRange: DEFAULT_PRICE_RANGE },
};

const SORTS = [
	{ id: 'new', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'lowest', label: 'Lowest price', sort: 'productPrice', direction: Direction.ASC },
	{ id: 'highest', label: 'Highest price', sort: 'productPrice', direction: Direction.DESC },
	{ id: 'liked', label: 'Most liked', sort: 'productLikes', direction: Direction.DESC },
	{ id: 'viewed', label: 'Most viewed', sort: 'productViews', direction: Direction.DESC },
];

// ?input= comes from links and the address bar, so a broken value falls back to the defaults
const parseInput = (raw: unknown): ProductsInquiry => {
	if (typeof raw !== 'string') return DEFAULT_INPUT;
	try {
		const parsed = JSON.parse(raw);
		return {
			...DEFAULT_INPUT,
			...parsed,
			page: Math.max(1, Number(parsed?.page) || 1),
			search: { ...DEFAULT_INPUT.search, ...(parsed?.search ?? {}) },
		};
	} catch (err) {
		return DEFAULT_INPUT;
	}
};

type ListKey = 'locationList' | 'typeList' | 'occasionList';

const ProductList: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
	const searchFilter = useMemo(() => parseInput(router.query.input), [router.query.input]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { loading, data } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		skip: !router.isReady,
	});
	const products: Product[] = data?.getProducts?.list ?? [];
	const total: number = data?.getProducts?.metaCounter?.[0]?.total ?? 0;

	const { data: facetsData } = useQuery(GET_PRODUCT_FACETS, { fetchPolicy: 'cache-and-network' });
	const facets: ProductFacets | undefined = facetsData?.getProductFacets;

	const { data: agentsData } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} } },
	});
	const storeCount: number = agentsData?.getAgents?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const pushFilter = async (next: ProductsInquiry) => {
		await router.push({ pathname: '/product', query: { input: JSON.stringify(next) } }, undefined, { scroll: false });
	};

	// Any filter or sort change starts again from page 1
	const applySearch = (search: ProductsInquiry['search']) => pushFilter({ ...searchFilter, page: 1, search });

	const resetHandler = () => pushFilter(DEFAULT_INPUT);

	const removeValue = (key: ListKey, value: string) => {
		const search: any = { ...searchFilter.search };
		search[key] = (search[key] ?? []).filter((item: string) => item !== value);
		if (!search[key].length) delete search[key];
		applySearch(search);
	};

	const sortHandler = (option: (typeof SORTS)[number]) => {
		setSortAnchor(null);
		pushFilter({ ...searchFilter, page: 1, sort: option.sort, direction: option.direction });
	};

	const pageHandler = (_: unknown, page: number) => {
		pushFilter({ ...searchFilter, page });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// The mutation returns productLikes + meLiked, so Apollo updates the card in the cache
	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { input: id } });
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <h1>PRODUCTS MOBILE</h1>;
	}

	const { search } = searchFilter;
	const currentSort =
		SORTS.find((item) => item.sort === searchFilter.sort && item.direction === searchFilter.direction) ?? SORTS[0];
	const price = search.pricesRange ?? DEFAULT_PRICE_RANGE;
	const priceChanged = price.start !== DEFAULT_PRICE_RANGE.start || price.end !== DEFAULT_PRICE_RANGE.end;
	const pageCount = Math.max(1, Math.ceil(total / searchFilter.limit));
	const chips: { key: string; label: string; onRemove: () => void }[] = [
		...(['locationList', 'typeList', 'occasionList'] as ListKey[]).flatMap((key) =>
			((search[key] as string[] | undefined) ?? []).map((value) => ({
				key: `${key}-${value}`,
				label: t(toLabel(value)),
				onRemove: () => removeValue(key, value),
			})),
		),
		...(search.text
			? [
					{
						key: 'text',
						label: `“${search.text}”`,
						onRemove: () => {
							const { text, ...rest } = search;
							applySearch(rest);
						},
					},
			  ]
			: []),
		...(priceChanged
			? [
					{
						key: 'price',
						label: `$${price.start} – $${price.end}`,
						onRemove: () => applySearch({ ...search, pricesRange: DEFAULT_PRICE_RANGE }),
					},
			  ]
			: []),
	];

	return (
		<div id="product-list-page">
			<div className="container">
				<header className={'catalog-header'}>
					<div className={'catalog-intro'}>
						<nav className={'breadcrumb'} aria-label={'breadcrumb'}>
							<Link href={'/'}>{t('Home')}</Link>
							<span aria-hidden>/</span>
							<span>{t('Catalog')}</span>
							<span aria-hidden>/</span>
							<span className={'current'}>{t('Product Search')}</span>
						</nav>
						<h1>{t('Product Search & Catalog')}</h1>
						<p>
							{t(
								'Browse fresh flowers, handmade chocolates and celebration cakes from local florists, chocolatiers and bakers across Korea',
							)}
						</p>
					</div>
					<ul className={'catalog-badges'}>
						<li>
							<Inventory2OutlinedIcon aria-hidden />
							{facets?.total ?? total} {t('products')}
						</li>
						<li>
							<StorefrontOutlinedIcon aria-hidden />
							{storeCount} {t('local stores')}
						</li>
						<li>
							<LocalShippingOutlinedIcon aria-hidden />
							{t('Delivery in 9 cities')}
						</li>
					</ul>
				</header>

				<div className={'catalog-toolbar'}>
					<div className={'active-filters'}>
						<span className={'toolbar-label'}>
							<TuneIcon aria-hidden />
							{t('Filters')}:
						</span>
						{chips.length === 0 ? (
							<span className={'filter-chip muted'}>{t('All products')}</span>
						) : (
							chips.map((chip) => (
								<button type="button" key={chip.key} className={'filter-chip'} onClick={chip.onRemove}>
									<span>{chip.label}</span>
									<CloseIcon aria-label={t('Remove filter')} />
								</button>
							))
						)}
						{chips.length > 0 && (
							<button type="button" className={'reset-link'} onClick={resetHandler}>
								{t('Reset all')}
							</button>
						)}
					</div>
					<div className={'sort-box'}>
						<span className={'toolbar-label'}>{t('Sort by')}</span>
						<button
							type="button"
							className={'sort-btn'}
							aria-haspopup="menu"
							aria-expanded={Boolean(sortAnchor)}
							onClick={(e: MouseEvent<HTMLElement>) => setSortAnchor(e.currentTarget)}
						>
							<span>{t(currentSort.label)}</span>
							<KeyboardArrowDownRoundedIcon />
						</button>
						<Menu
							anchorEl={sortAnchor}
							open={Boolean(sortAnchor)}
							onClose={() => setSortAnchor(null)}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							sx={{
								mt: '6px',
								'& .MuiPaper-root': {
									minWidth: 180,
									borderRadius: '12px',
									border: '1px solid var(--nv-line-soft)',
									bgcolor: 'var(--nv-surface)',
									color: 'var(--nv-ink)',
									boxShadow: 'var(--nv-shadow-lg)',
								},
								'& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-selected': { bgcolor: 'var(--nv-primary-light)' },
							}}
						>
							{SORTS.map((option) => (
								<MenuItem
									key={option.id}
									selected={option.id === currentSort.id}
									onClick={() => sortHandler(option)}
									sx={{ fontSize: 13 }}
								>
									{t(option.label)}
								</MenuItem>
							))}
						</Menu>
					</div>
				</div>

				<div className={'catalog-layout'}>
					<Filter searchFilter={searchFilter} facets={facets} onApply={applySearch} onReset={resetHandler} />

					<section className={'catalog-results'} aria-live="polite">
						{/* Server render and the first client render both show skeletons, so hydration matches */}
						{(!router.isReady || loading) && products.length === 0 ? (
							<CardSkeletons count={6} />
						) : products.length === 0 ? (
							<div className={'catalog-empty'}>
								<p>{t('No products match these filters')}</p>
								<button type="button" className={'reset-link'} onClick={resetHandler}>
									{t('Reset all')}
								</button>
							</div>
						) : (
							<div className={'catalog-grid'}>
								{products.map((product: Product) => (
									<ProductCard product={product} likeProductHandler={likeProductHandler} key={product._id} />
								))}
							</div>
						)}

						{total > 0 && (
							<footer className={'catalog-pagination'}>
								<Pagination
									page={Math.min(searchFilter.page, pageCount)}
									count={pageCount}
									onChange={pageHandler}
									shape="rounded"
								/>
								<p>
									{t('Total')} <strong>{total}</strong> {t('products')} ({t('page')} {searchFilter.page} / {pageCount})
								</p>
							</footer>
						)}
					</section>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(ProductList);
