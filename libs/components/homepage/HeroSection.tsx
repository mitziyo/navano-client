import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import HeaderFilter from './HeaderFilter';
import { GET_AGENTS, GET_PRODUCT_FACETS } from '../../../apollo/user/query';
import { ProductFacets } from '../../types/product/product';
import { ProductType } from '../../enums/product.enum';
import { Direction } from '../../enums/common.enum';

// Product search link with one category preset, in the format /product reads from ?input=
const categoryLink = (type: ProductType) => ({
	pathname: '/product',
	query: {
		input: JSON.stringify({ page: 1, limit: 9, sort: 'createdAt', direction: Direction.DESC, search: { typeList: [type] } }),
	},
});

const categories = [
	{ type: ProductType.FLOWER, label: 'Flowers', Icon: LocalFloristOutlinedIcon },
	{ type: ProductType.CAKE, label: 'Cakes', Icon: CakeOutlinedIcon },
	{ type: ProductType.CHOCOLATE, label: 'Chocolates', Icon: CookieOutlinedIcon },
];

const HeroSection = () => {
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const { data: facetsData } = useQuery(GET_PRODUCT_FACETS, { fetchPolicy: 'cache-first' });
	const facets: ProductFacets | undefined = facetsData?.getProductFacets;

	const { data: agentsData } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: 1, sort: 'createdAt', direction: Direction.DESC, search: {} } },
	});
	const storeCount: number = agentsData?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const stats = [
		{ label: 'Stores', value: storeCount },
		{ label: 'Products', value: facets?.total ?? 0 },
		{ label: 'Cities', value: facets?.locations?.length ?? 0 },
	];

	return (
		<section className={'home-hero'} aria-labelledby="hero-title">
			{/* Full-bleed band: bouquet photo on the right fading into a cream band, copy on the page grid */}
			<div className={'hero-card'}>
				<div className={'hero-media'} aria-hidden>
					<img src={'/img/banner/product-hero.jpg'} alt="" />
				</div>

				<div className={'container hero-inner'}>
					<div className={'hero-copy'}>
						<span className={'hero-badge'}>
							<span className={'pulse'} aria-hidden />
							{t('Handmade by local stores')}
						</span>
						<h1 id="hero-title">
							{t('Flowers, cakes & chocolates')} <em>{t('for every occasion')}</em>
						</h1>
						<p>
							{t(
								'Fresh bouquets, celebration cakes and handmade chocolates from independent florists, bakers and chocolatiers near you',
							)}
						</p>

						<ul className={'hero-categories'}>
							{categories.map(({ type, label, Icon }) => (
								<li key={type}>
									<Link href={categoryLink(type)}>
										<Icon aria-hidden />
										{t(label)}
									</Link>
								</li>
							))}
						</ul>

						<div className={'hero-actions'}>
							<Link href={'/product'} className={'hero-cta is-primary'}>
								{t('Shop now')}
								<ArrowForwardIcon aria-hidden />
							</Link>
							<Link href={'/agent'} className={'hero-cta is-secondary'}>
								{t('Browse stores')}
							</Link>
						</div>

						<dl className={'hero-stats'}>
							{stats.map((stat) => (
								<div key={stat.label}>
									<dt>{t(stat.label)}</dt>
									<dd>{stat.value}</dd>
								</div>
							))}
						</dl>
					</div>
				</div>
			</div>

			<div className={'container'}>
				<div className={'hero-search'}>
					<HeaderFilter />
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
