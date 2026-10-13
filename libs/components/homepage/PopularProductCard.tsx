import React from 'react';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ProductTypeIcon from '../common/ProductTypeIcon';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
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
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');

	/** HANDLERS **/

	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${product?.productImages[0]})` }}
					onClick={() => {
						pushDetailHandler(product._id);
					}}
				>
					{product && product?.productRank >= topProductRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>${product.productPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong
						className={'title'}
						onClick={() => {
							pushDetailHandler(product._id);
						}}
					>
						{product.productTitle}
					</strong>
					<p className={'desc'}>{product.productAddress}</p>
					<div className={'options'}>
						<div>
							<ProductTypeIcon type={product?.productType} sx={{ fontSize: 17, color: 'var(--nv-primary-strong)' }} />
							<span>{product?.productType}</span>
						</div>
						<div>
							<PlaceOutlinedIcon aria-hidden sx={{ fontSize: 17, color: 'var(--nv-primary-strong)' }} />
							<span>{product?.productLocation}</span>
						</div>
						<div>
							<Inventory2OutlinedIcon aria-hidden sx={{ fontSize: 17, color: 'var(--nv-primary-strong)' }} />
							<span>{product?.productItemCount} items</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{product?.productType?.toLowerCase()}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{product?.productViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
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
	}
};

export default PopularProductCard;
