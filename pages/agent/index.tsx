import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Pagination } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import AgentCard from '../../libs/components/common/AgentCard';
import { CardSkeletons } from '../../libs/components/homepage/SectionState';
import { toLabel } from '../../libs/components/homepage/productLabels';
import { Member } from '../../libs/types/member/member';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { ProductFacets } from '../../libs/types/product/product';
import { Direction } from '../../libs/enums/common.enum';
import { ProductLocation, ProductType } from '../../libs/enums/product.enum';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS, GET_PRODUCT_FACETS } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const DEFAULT_INPUT: AgentsInquiry = {
	page: 1,
	limit: 6,
	sort: 'memberLikes',
	direction: Direction.DESC,
	search: {},
};

const SORTS = [
	{ id: 'liked', label: 'Most liked', sort: 'memberLikes', direction: Direction.DESC },
	{ id: 'products', label: 'Most products', sort: 'memberProducts', direction: Direction.DESC },
	{ id: 'viewed', label: 'Most viewed', sort: 'memberViews', direction: Direction.DESC },
	{ id: 'new', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
];

// ?input= comes from links and the address bar, so a broken value falls back to the defaults
const parseInput = (raw: unknown): AgentsInquiry => {
	if (typeof raw !== 'string') return DEFAULT_INPUT;
	try {
		const parsed = JSON.parse(raw);
		return {
			...DEFAULT_INPUT,
			...parsed,
			page: Math.max(1, Number(parsed?.page) || 1),
			search: { ...(parsed?.search ?? {}) },
		};
	} catch (err) {
		return DEFAULT_INPUT;
	}
};

const AgentList: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const searchFilter = useMemo(() => parseInput(router.query.input), [router.query.input]);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { loading, data } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		skip: !router.isReady,
	});
	const agents: Member[] = data?.getAgents?.list ?? [];
	const total: number = data?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const { data: allData } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} } },
	});
	const storeCount: number = allData?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const { data: facetsData } = useQuery(GET_PRODUCT_FACETS, { fetchPolicy: 'cache-and-network' });
	const facets: ProductFacets | undefined = facetsData?.getProductFacets;

	/** LIFECYCLES **/
	useEffect(() => {
		setSearchText(searchFilter.search.text ?? '');
	}, [searchFilter.search.text]);

	/** HANDLERS **/
	const pushFilter = async (next: AgentsInquiry) => {
		await router.push({ pathname: '/agent', query: { input: JSON.stringify(next) } }, undefined, { scroll: false });
	};

	// Any filter or sort change starts again from page 1
	const applySearch = (search: AgentsInquiry['search']) => pushFilter({ ...searchFilter, page: 1, search });

	const setList = (key: 'locationList' | 'typeList', value: string) => {
		const search: any = { ...searchFilter.search };
		if (value) search[key] = [value];
		else delete search[key];
		applySearch(search);
	};

	const submitText = () => {
		const search: any = { ...searchFilter.search, text: searchText.trim() };
		if (!search.text) delete search.text;
		applySearch(search);
	};

	const sortHandler = (id: string) => {
		const option = SORTS.find((item) => item.id === id) ?? SORTS[0];
		pushFilter({ ...searchFilter, page: 1, sort: option.sort, direction: option.direction });
	};

	const pageHandler = (_: unknown, page: number) => {
		pushFilter({ ...searchFilter, page });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// The mutation returns memberLikes + meLiked, so Apollo updates the card in the cache
	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <h1>AGENTS PAGE MOBILE</h1>;
	}

	const { search } = searchFilter;
	const location = search.locationList?.[0] ?? '';
	const type = search.typeList?.[0] ?? '';
	const currentSort =
		SORTS.find((item) => item.sort === searchFilter.sort && item.direction === searchFilter.direction) ?? SORTS[0];
	const pageCount = Math.max(1, Math.ceil(total / searchFilter.limit));
	const from = total ? (searchFilter.page - 1) * searchFilter.limit + 1 : 0;
	const to = Math.min(total, searchFilter.page * searchFilter.limit);
	const chips = [
		...(search.text ? [{ key: 'text', label: `“${search.text}”`, onRemove: () => applySearch({ ...search, text: undefined }) }] : []),
		...(location ? [{ key: 'loc', label: t(toLabel(location)), onRemove: () => setList('locationList', '') }] : []),
		...(type ? [{ key: 'type', label: t(toLabel(type)), onRemove: () => setList('typeList', '') }] : []),
	];

	return (
		<div id="store-list-page">
			<div className="container">
				<section className={'store-hero'}>
					<div className={'store-hero-media'} aria-hidden>
						<img src={'/img/banner/stores-hero.jpg'} alt="" />
					</div>
					<div className={'store-hero-copy'}>
						<nav className={'breadcrumb'} aria-label={'breadcrumb'}>
							<Link href={'/'}>{t('Home')}</Link>
							<span aria-hidden>/</span>
							<span>{t('Stores')}</span>
							<span aria-hidden>/</span>
							<span className={'current'}>{t('All stores')}</span>
						</nav>
						<span className={'hero-badge'}>
							<span className={'pulse'} aria-hidden />
							{t('Local florists, chocolatiers and bakers')}
						</span>
						<h1>
							{t('Stores &')} <em>{t('local ateliers')}</em>
						</h1>
						<p>
							{t(
								'Buy directly from the people who make it — florists, pâtissiers and chocolatiers in cities across Korea',
							)}
						</p>
						<dl className={'hero-stats'}>
							<div>
								<dt>{t('Stores')}</dt>
								<dd>{storeCount}</dd>
							</div>
							<div>
								<dt>{t('Products')}</dt>
								<dd>{facets?.total ?? 0}</dd>
							</div>
							<div>
								<dt>{t('Cities')}</dt>
								<dd>{facets?.locations?.length ?? 0}</dd>
							</div>
							<div>
								<dt>{t('Categories')}</dt>
								<dd>{Object.values(ProductType).length}</dd>
							</div>
						</dl>
					</div>
				</section>

				{/* Product counts per category from the live facets */}
				<dl className={'network-strip'} aria-label={t('Store network')}>
					{Object.values(ProductType).map((value) => (
						<div key={value}>
							<dt>{t(toLabel(value))}</dt>
							<dd>
								{facets?.types?.find((item) => item.value === value)?.count ?? 0}
								<small>{t('products')}</small>
							</dd>
						</div>
					))}
					<div>
						<dt>{t('Busiest city')}</dt>
						<dd>{facets?.locations?.[0] ? t(toLabel(facets.locations[0].value)) : '—'}</dd>
					</div>
				</dl>

				<section className={'store-toolbar'} aria-label={t('Search stores')}>
					<div className={'toolbar-row'}>
						<form
							className={'toolbar-search'}
							role={'search'}
							onSubmit={(e) => {
								e.preventDefault();
								submitText();
							}}
						>
							<SearchIcon aria-hidden />
							<input
								type="text"
								value={searchText}
								placeholder={t('Search stores by name')}
								aria-label={t('Search stores by name')}
								onChange={(e) => setSearchText(e.target.value)}
							/>
						</form>
						<label className={'toolbar-select'}>
							<span className={'sr-only'}>{t('City')}</span>
							<select value={location} onChange={(e) => setList('locationList', e.target.value)}>
								<option value="">{t('All cities')}</option>
								{Object.values(ProductLocation).map((value) => (
									<option key={value} value={value}>
										{t(toLabel(value))}
									</option>
								))}
							</select>
							<ExpandMoreIcon aria-hidden />
						</label>
						<label className={'toolbar-select'}>
							<span className={'sr-only'}>{t('Category')}</span>
							<select value={type} onChange={(e) => setList('typeList', e.target.value)}>
								<option value="">{t('All categories')}</option>
								{Object.values(ProductType).map((value) => (
									<option key={value} value={value}>
										{t(toLabel(value))}
									</option>
								))}
							</select>
							<ExpandMoreIcon aria-hidden />
						</label>
						<label className={'toolbar-select sort'}>
							<span className={'select-prefix'}>{t('Sort')}:</span>
							<select value={currentSort.id} onChange={(e) => sortHandler(e.target.value)}>
								{SORTS.map((option) => (
									<option key={option.id} value={option.id}>
										{t(option.label)}
									</option>
								))}
							</select>
							<ExpandMoreIcon aria-hidden />
						</label>
					</div>
					<div className={'toolbar-row meta'}>
						<div className={'active-filters'}>
							<span className={'toolbar-label'}>{t('Active filters')}:</span>
							{chips.length === 0 ? (
								<span className={'filter-chip muted'}>{t('All stores')}</span>
							) : (
								chips.map((chip) => (
									<button type="button" key={chip.key} className={'filter-chip'} onClick={chip.onRemove}>
										<span>{chip.label}</span>
										<CloseIcon aria-label={t('Remove filter')} />
									</button>
								))
							)}
						</div>
						<span className={'showing'}>
							{t('Showing')} <strong>{agents.length}</strong> {t('of')} <strong>{total}</strong> {t('stores')}
						</span>
					</div>
				</section>

				{/* Server render and the first client render both show skeletons, so hydration matches */}
				{(!router.isReady || loading) && agents.length === 0 ? (
					<CardSkeletons count={6} variant={'store'} />
				) : agents.length === 0 ? (
					<div className={'store-empty'}>
						<p>{t('No stores match these filters')}</p>
						<button type="button" className={'reset-link'} onClick={() => pushFilter(DEFAULT_INPUT)}>
							{t('Reset all')}
						</button>
					</div>
				) : (
					<div className={'store-grid'}>
						{agents.map((agent: Member) => (
							<AgentCard agent={agent} likeMemberHandler={likeMemberHandler} key={agent._id} />
						))}
					</div>
				)}

				<section className={'join-banner'}>
					<div>
						<span className={'join-eyebrow'}>
							<WorkspacePremiumOutlinedIcon aria-hidden />
							{t('For florists, bakers and chocolatiers')}
						</span>
						<h2>{t('Open your store on Navano')}</h2>
						<p>{t('List your bouquets, cakes and chocolates, reach customers in your city and manage orders from My Page')}</p>
					</div>
					<div className={'join-actions'}>
						<Link href={'/cs?tab=faq'} className={'join-btn ghost'}>
							{t('How it works')}
						</Link>
						<Link href={'/account/join'} className={'join-btn primary'}>
							<span>{t('Join as a store')}</span>
							<ArrowForwardIcon />
						</Link>
					</div>
				</section>

				{total > 0 && (
					<footer className={'store-pagination'}>
						<p>
							{t('Total')} <strong>{total}</strong> {t('stores')} ({from}–{to})
						</p>
						<Pagination
							page={Math.min(searchFilter.page, pageCount)}
							count={pageCount}
							onChange={pageHandler}
							shape="rounded"
						/>
					</footer>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(AgentList);
