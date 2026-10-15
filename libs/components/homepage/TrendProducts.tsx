import React from 'react';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import TrendProductCard from './TrendProductCard';
import SectionHeading from './SectionHeading';
import { CardSkeletons, EmptyState } from './SectionState';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Message } from '../../enums/common.enum';

interface TrendProductsProps {
	initialInput: ProductsInquiry;
}

const TrendProducts = (props: TrendProductsProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const { loading, data } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
	});
	const trendProducts: Product[] = data?.getProducts?.list ?? [];

	/** HANDLERS **/
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

	return (
		<section className={'home-section trend-section'} aria-labelledby="trend-title">
			<div className={'container'}>
				<SectionHeading
					id="trend-title"
					eyebrow={t('#01 Most loved')}
					title={t('Trend Products')}
					subtitle={t('Trend is based on likes from our customers')}
					action={
						<Link
							href={{ pathname: '/product', query: { input: JSON.stringify({ ...initialInput, limit: 9 }) } }}
							className={'link-arrow'}
						>
							<span>{t('See all trends')}</span>
							<ArrowForwardIcon />
						</Link>
					}
				/>
				{loading && trendProducts.length === 0 ? (
					<CardSkeletons count={4} />
				) : trendProducts.length === 0 ? (
					<EmptyState title={t('No trending products yet')} />
				) : (
					<div className={'trend-grid'}>
						{trendProducts.map((product: Product) => (
							<TrendProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />
						))}
					</div>
				)}
			</div>
		</section>
	);
};

TrendProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'productLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TrendProducts;
