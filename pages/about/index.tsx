import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery } from '@apollo/client';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductTypeIcon from '../../libs/components/common/ProductTypeIcon';
import { toLabel } from '../../libs/components/homepage/productLabels';
import { CS_PHONE, CS_PHONE_HREF } from '../../libs/components/cs/csContent';
import { GET_AGENTS, GET_PRODUCT_FACETS } from '../../apollo/user/query';
import { ProductType } from '../../libs/enums/product.enum';
import { Direction } from '../../libs/enums/common.enum';
import { Member } from '../../libs/types/member/member';
import { ProductFacets } from '../../libs/types/product/product';
import { REACT_APP_API_URL } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORIES = [
	{
		type: ProductType.FLOWER,
		title: 'Flowers & bouquets',
		text: 'Seasonal bouquets, centerpieces and potted plants arranged by local florists',
		image: '/img/banner/product-hero.jpg',
	},
	{
		type: ProductType.CHOCOLATE,
		title: 'Chocolates',
		text: 'Bonbons, truffles and gift boxes made in small batches by chocolatiers',
		image: '/img/banner/hero-chocolatier.jpg',
	},
	{
		type: ProductType.CAKE,
		title: 'Cakes',
		text: 'Celebration cakes, tarts and pastries baked to order by pâtisseries',
		image: '/img/banner/hero-atelier.jpg',
	},
];

const BUYER_STEPS = [
	{ icon: <TravelExploreOutlinedIcon />, title: 'Find', text: 'Search by city, category and occasion — birthday, wedding, anniversary or holiday' },
	{ icon: <StorefrontOutlinedIcon />, title: 'Choose a maker', text: 'Compare products and store profiles, read reviews and ask the store directly' },
	{ icon: <FavoriteBorderIcon />, title: 'Celebrate', text: 'Save favorites, follow stores you love and share your story in the community' },
];

const STORE_STEPS = [
	{ icon: <AddBusinessOutlinedIcon />, title: 'Open a store', text: 'Sign up with the Store role — it is free' },
	{ icon: <Inventory2OutlinedIcon />, title: 'List products', text: 'Add photos, price, item count and occasion from My Page' },
	{ icon: <GroupsOutlinedIcon />, title: 'Grow with the community', text: 'Get likes, followers and reviews from customers in your city' },
];

const productsHref = (type: ProductType) => ({
	pathname: '/product',
	query: { input: JSON.stringify({ page: 1, limit: 9, search: { typeList: [type] } }) },
});

const About: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const { data: storesData } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 4, sort: 'memberLikes', direction: Direction.DESC, search: {} } },
	});
	const { data: facetsData } = useQuery(GET_PRODUCT_FACETS, { fetchPolicy: 'cache-and-network' });
	const stores: Member[] = storesData?.getAgents?.list ?? [];
	const storeCount: number = storesData?.getAgents?.metaCounter?.[0]?.total ?? 0;
	const facets: ProductFacets | undefined = facetsData?.getProductFacets;
	const countOf = (type: ProductType) => facets?.types?.find((item) => item.value === type)?.count ?? 0;

	if (device === 'mobile') {
		return <div>ABOUT PAGE MOBILE</div>;
	}

	const stats = [
		{ label: t('Stores'), value: storeCount, note: t('Florists, bakers and chocolatiers') },
		{ label: t('Products'), value: facets?.total ?? 0, note: t('Active listings right now') },
		{ label: t('Cities'), value: facets?.locations?.length ?? 0, note: t('Cities with active products') },
		{ label: t('Categories'), value: CATEGORIES.length, note: t('Flowers · Chocolates · Cakes') },
	];

	return (
		<div id="about-page">
			{/* Hero: photo across the full width */}
			<section className={'about-hero'}>
				<img className={'about-hero-media'} src={'/img/banner/hero-florist.jpg'} alt="" aria-hidden />
				<div className={'container'}>
					<div className={'about-hero-copy'}>
						<nav className={'breadcrumb'} aria-label={'breadcrumb'}>
							<Link href={'/'}>{t('Home')}</Link>
							<span aria-hidden>/</span>
							<span className={'current'}>{t('About')}</span>
						</nav>
						<span className={'hero-badge'}>
							<span className={'pulse'} aria-hidden />
							{t('About Navano')}
						</span>
						<h1>
							{t('Flowers, cakes & chocolates')} <em>{t('straight from the makers')}</em>
						</h1>
						<p>
							{t(
								'Navano is a marketplace for independent florists, pâtisseries and chocolatiers. We help them reach people in their city and help you find the right gift for every occasion.',
							)}
						</p>
						<div className={'hero-actions'}>
							<Link href={'/product'} className={'about-btn primary'}>
								{t('Browse products')}
								<ArrowForwardIcon aria-hidden />
							</Link>
							<Link href={'/agent'} className={'about-btn ghost'}>
								{t('Meet the stores')}
							</Link>
						</div>
					</div>
				</div>
			</section>

			<div className={'container about-body'}>
				{/* Mission */}
				<section className={'about-mission'}>
					<div>
						<span className={'eyebrow'}>{t('Our mission')}</span>
						<h2>{t('Bring local makers and the people who celebrate closer together')}</h2>
					</div>
					<div className={'mission-text'}>
						<p>
							{t(
								'Every bouquet, cake and box of chocolates on Navano is made by a real store in a Korean city. Stores list their own products, set their prices and talk to customers directly — we keep the shop window open for them.',
							)}
						</p>
						<div className={'mission-cards'}>
							<article>
								<span className={'icon'}>
									<StorefrontOutlinedIcon aria-hidden />
								</span>
								<strong>{t('Independent stores')}</strong>
								<p>{t('Only small makers — florists, pâtissiers and chocolatiers')}</p>
							</article>
							<article>
								<span className={'icon'}>
									<CelebrationOutlinedIcon aria-hidden />
								</span>
								<strong>{t('Made for occasions')}</strong>
								<p>{t('Every product is tagged for a birthday, wedding, anniversary or holiday')}</p>
							</article>
						</div>
					</div>
				</section>

				{/* Live numbers */}
				<dl className={'about-stats'} aria-label={t('Navano in numbers')}>
					{stats.map((stat) => (
						<div key={stat.label}>
							<dt>{stat.label}</dt>
							<dd>{stat.value}</dd>
							<dd className={'note'}>{stat.note}</dd>
						</div>
					))}
				</dl>

				{/* Categories */}
				<section className={'about-section'}>
					<header className={'section-head'}>
						<span className={'eyebrow'}>{t('What you can find')}</span>
						<h2>{t('Three crafts, one marketplace')}</h2>
					</header>
					<div className={'category-grid'}>
						{CATEGORIES.map((category) => (
							<Link href={productsHref(category.type)} className={'category-card'} key={category.type}>
								<span className={'category-media'}>
									<img src={category.image} alt="" loading="lazy" />
									<span className={'category-count'}>
										{countOf(category.type)} {t('products')}
									</span>
								</span>
								<span className={'category-body'}>
									<span className={'category-icon'}>
										<ProductTypeIcon type={category.type} />
									</span>
									<strong>{t(category.title)}</strong>
									<span>{t(category.text)}</span>
									<span className={'category-link'}>
										{t('Shop')} {t(toLabel(category.type)).toLowerCase()}
										<ArrowForwardIcon aria-hidden />
									</span>
								</span>
							</Link>
						))}
					</div>
				</section>

				{/* How it works */}
				<section className={'about-section about-how'}>
					<div className={'how-card'}>
						<span className={'eyebrow'}>{t('For buyers')}</span>
						<h3>{t('How it works')}</h3>
						<ol>
							{BUYER_STEPS.map((step, index) => (
								<li key={step.title}>
									<span className={'step-icon'}>{step.icon}</span>
									<span>
										<strong>
											{index + 1}. {t(step.title)}
										</strong>
										<span>{t(step.text)}</span>
									</span>
								</li>
							))}
						</ol>
					</div>
					<div className={'how-card accent'}>
						<span className={'eyebrow'}>{t('For stores')}</span>
						<h3>{t('Sell on Navano')}</h3>
						<ol>
							{STORE_STEPS.map((step, index) => (
								<li key={step.title}>
									<span className={'step-icon'}>{step.icon}</span>
									<span>
										<strong>
											{index + 1}. {t(step.title)}
										</strong>
										<span>{t(step.text)}</span>
									</span>
								</li>
							))}
						</ol>
						<Link href={'/account/join'} className={'about-btn primary'}>
							{t('Join as a store')}
							<ArrowForwardIcon aria-hidden />
						</Link>
					</div>
				</section>

				{/* Top stores */}
				{stores.length > 0 && (
					<section className={'about-section'}>
						<header className={'section-head row'}>
							<div>
								<span className={'eyebrow'}>{t('Loved by customers')}</span>
								<h2>{t('Top stores')}</h2>
							</div>
							<Link href={'/agent'} className={'section-link'}>
								{t('See all stores')}
								<ArrowForwardIcon aria-hidden />
							</Link>
						</header>
						<div className={'store-row'}>
							{stores.map((store) => (
								<Link href={`/agent/detail?agentId=${store._id}`} className={'store-tile'} key={store._id}>
									<img
										src={store.memberImage ? `${REACT_APP_API_URL}/${store.memberImage}` : '/img/profile/defaultUser.svg'}
										alt=""
									/>
									<strong>{store.memberFullName || store.memberNick}</strong>
									{store.memberAddress && (
										<span className={'store-city'}>
											<PlaceOutlinedIcon aria-hidden />
											{store.memberAddress.split(',').pop()?.trim()}
										</span>
									)}
									<span className={'store-stats'}>
										<span>
											{store.memberProducts} {t('products')}
										</span>
										<span>
											{store.memberLikes} {t('likes')}
										</span>
									</span>
								</Link>
							))}
						</div>
					</section>
				)}

				{/* Help */}
				<section className={'about-help'}>
					<div>
						<span className={'eyebrow'}>
							<SupportAgentOutlinedIcon aria-hidden />
							{t('Need help?')}
						</span>
						<h2>{t('Talk to customer care')}</h2>
						<p>{t('Questions about a product, a store or your account — we are here to help')}</p>
					</div>
					<div className={'help-actions'}>
						<Link href={'/cs'} className={'about-btn ghost'}>
							<ForumOutlinedIcon aria-hidden />
							{t('Help center')}
						</Link>
						<a href={CS_PHONE_HREF} className={'about-btn primary'}>
							<CallOutlinedIcon aria-hidden />
							{CS_PHONE}
						</a>
					</div>
				</section>
			</div>
		</div>
	);
};

export default withLayoutBasic(About);
