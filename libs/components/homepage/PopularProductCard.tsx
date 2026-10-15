import React from 'react';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ProductTypeIcon from '../common/ProductTypeIcon';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Product } from '../../types/product/product';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL, topProductRank } from '../../config';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { itemCountLabel, statusLabel, toLabel } from './productLabels';

interface PopularProductCardProps {
	product: Product;
}

const PopularProductCard = (props: PopularProductCardProps) => {
	const { product } = props;
	const router = useRouter();
	const { t } = useTranslation('common');

	/** HANDLERS **/

	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	const status = statusLabel(product.productStatus);
	return (
		<article className="popular-card">
			<button type="button" className={'card-media'} onClick={() => pushDetailHandler(product._id)}>
				<img src={`${REACT_APP_API_URL}/${product?.productImages[0]}`} alt={product.productTitle} loading="lazy" />
				{status && <span className={'status-badge'}>{t(status)}</span>}
				{product.productRank >= topProductRank && <span className={'rank-badge'}>{t('Top')}</span>}
				<span className={'price-tag'}>${product.productPrice}</span>
			</button>
			<div className={'card-body'}>
				<h3 className={'title'} onClick={() => pushDetailHandler(product._id)}>
					{product.productTitle}
				</h3>
				<p className={'address'}>{product.productAddress}</p>
				<dl className={'spec-strip'}>
					<div>
						<dt>{t('Type')}</dt>
						<dd>{t(toLabel(product.productType))}</dd>
					</div>
					<div>
						<dt>{t('Region')}</dt>
						<dd>{toLabel(product.productLocation)}</dd>
					</div>
					<div>
						<dt>{t('Pack')}</dt>
						<dd>{itemCountLabel(product.productType, product.productItemCount)}</dd>
					</div>
				</dl>
				<div className={'card-foot'}>
					<span className={'occasion'}>{t(toLabel(product.productOccasion))}</span>
					<div className={'stats'}>
						<span aria-label={`${product.productViews} views`}>
							<VisibilityOutlinedIcon aria-hidden />
							{product.productViews}
						</span>
						<span className={'likes'} aria-label={`${product.productLikes} likes`}>
							<FavoriteIcon aria-hidden />
							{product.productLikes}
						</span>
					</div>
				</div>
			</div>
		</article>
	);
};

export default PopularProductCard;
