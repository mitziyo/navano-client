import React from 'react';
import { Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { Product } from '../../types/product/product';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { itemCountLabel, toLabel } from './productLabels';

interface TrendProductCardProps {
	product: Product;
	likeProductHandler: any;
}

const TrendProductCard = (props: TrendProductCardProps) => {
	const { product, likeProductHandler } = props;
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const liked = Boolean(product?.meLiked?.[0]?.myFavorite);

	/** HANDLERS **/
	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	return (
		<Box component={'article'} className="trend-card-box" data-type={product.productType}>
			<div className={'card-media'} onClick={() => pushDetailHandler(product._id)}>
				<img src={`${REACT_APP_API_URL}/${product?.productImages[0]}`} alt={product.productTitle} loading="lazy" />
				{product.productOccasion && <span className={'occasion'}>{t(toLabel(product.productOccasion))}</span>}
				<motion.button
					type="button"
					className={`like-btn ${liked ? 'liked' : ''}`}
					aria-label={
						liked ? `Remove ${product.productTitle} from favorites` : `Add ${product.productTitle} to favorites`
					}
					aria-pressed={liked}
					whileTap={{ scale: 0.82 }}
					onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
						e.stopPropagation();
						likeProductHandler(user, product?._id);
					}}
				>
					{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
				</motion.button>
			</div>

			<div className={'card-body'}>
				<div className={'kind'}>
					<span className={'category'}>{t(toLabel(product.productType))}</span>
					<span className={'count'}>{itemCountLabel(product.productType, product.productItemCount)}</span>
				</div>
				<h3
					className={'title'}
					tabIndex={0}
					onClick={() => pushDetailHandler(product._id)}
					onKeyDown={(e) => e.key === 'Enter' && pushDetailHandler(product._id)}
				>
					{product.productTitle}
				</h3>
				{product.productDesc && <p className={'desc'}>{product.productDesc}</p>}

				<div className={'card-foot'}>
					<div className={'price-box'}>
						<span className={'price-label'}>{t('Price')}</span>
						<strong className={'price'}>${product.productPrice}</strong>
					</div>
					<div className={'meta'}>
						<span>
							<PlaceOutlinedIcon aria-hidden />
							{toLabel(product.productLocation)}
						</span>
						<span aria-label={`${product.productViews} views`}>
							<VisibilityOutlinedIcon aria-hidden />
							{product.productViews}
						</span>
					</div>
				</div>
			</div>
		</Box>
	);
};

export default TrendProductCard;
