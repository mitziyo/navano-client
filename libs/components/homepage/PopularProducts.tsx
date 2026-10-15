import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import PopularProductCard from './PopularProductCard';
import SectionHeading from './SectionHeading';
import { CardSkeletons, EmptyState } from './SectionState';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

interface PopularProductsProps {
	initialInput: ProductsInquiry;
}

const PopularProducts = (props: PopularProductsProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const { loading, data } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
	});
	const popularProducts: Product[] = data?.getProducts?.list ?? [];

	return (
		<section className={'home-section popular-section tinted'} aria-labelledby="popular-title">
			<div className={'container'}>
				<SectionHeading
					id="popular-title"
					eyebrow={t('#02 Most viewed')}
					title={t('Popular Products')}
					subtitle={t('Popularity is based on how often customers view a product')}
					action={
						<Link href={'/product'} className={'link-arrow'}>
							<span>{t('See all categories')}</span>
							<NorthEastIcon />
						</Link>
					}
				/>
				{loading && popularProducts.length === 0 ? (
					<CardSkeletons count={3} />
				) : popularProducts.length === 0 ? (
					<EmptyState title={t('No popular products yet')} />
				) : (
					<div className={'popular-grid'}>
						{popularProducts.map((product: Product) => (
							<PopularProductCard key={product._id} product={product} />
						))}
					</div>
				)}
			</div>
		</section>
	);
};

PopularProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 3,
		sort: 'productViews',
		direction: 'DESC',
		search: {},
	},
};

export default PopularProducts;
