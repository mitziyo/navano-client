import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topProductRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { ProductType } from '../../enums/product.enum';
import { itemCountLabel, statusLabel, toLabel } from '../homepage/productLabels';

interface ProductCardType {
	product: Product;
	likeProductHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const typeIcon = (type: ProductType) => {
	if (type === ProductType.FLOWER) return <LocalFloristOutlinedIcon aria-hidden />;
	if (type === ProductType.CHOCOLATE) return <CookieOutlinedIcon aria-hidden />;
	return <CakeOutlinedIcon aria-hidden />;
};

const ProductCard = (props: ProductCardType) => {
	const { product, likeProductHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const imagePath: string = product?.productImages[0]
		? `${REACT_APP_API_URL}/${product?.productImages[0]}`
		: '/img/banner/header1.svg';
	const detailHref = { pathname: '/product/detail', query: { id: product?._id } };
	const liked = Boolean(myFavorites || product?.meLiked?.[0]?.myFavorite);
	const status = statusLabel(product?.productStatus);

	if (device === 'mobile') {
		return <div>PRODUCT CARD</div>;
	}

	return (
		<article className="catalog-card">
			<div className={'card-media'}>
				<Link href={detailHref} tabIndex={-1} aria-hidden>
					<img src={imagePath} alt={product.productTitle} loading="lazy" />
				</Link>
				<span className={'price-tag'}>${formatterStr(product?.productPrice)}</span>
				{product?.productRank > topProductRank && <span className={'rank-tag'}>{t('Top')}</span>}
				{status && <span className={'status-tag'}>{t(status)}</span>}
				{!recentlyVisited && (
					<button
						type="button"
						className={`like-btn ${liked ? 'liked' : ''}`}
						aria-pressed={liked}
						aria-label={liked ? `Remove ${product.productTitle} from favorites` : `Add ${product.productTitle} to favorites`}
						onClick={() => likeProductHandler?.(user, product?._id)}
					>
						{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
					</button>
				)}
			</div>

			<div className={'card-body'}>
				<span className={'card-kind'}>
					{t(toLabel(product.productType))} · {t(toLabel(product.productOccasion))}
				</span>
				<h3 className={'card-title'}>
					<Link href={detailHref}>{product.productTitle}</Link>
				</h3>
				<p className={'card-address'}>
					<PlaceOutlinedIcon aria-hidden />
					<span>{product.productAddress}</span>
				</p>
				{product.productDesc && <p className={'card-desc'}>{product.productDesc}</p>}

				<div className={'card-foot'}>
					<span className={'card-count'}>
						{typeIcon(product.productType)}
						{itemCountLabel(product.productType, product.productItemCount)}
					</span>
					<span className={'card-stats'}>
						<span aria-label={`${product.productViews} views`}>
							<VisibilityOutlinedIcon aria-hidden />
							{product.productViews}
						</span>
						<span className={'likes'} aria-label={`${product.productLikes} likes`}>
							<FavoriteBorderIcon aria-hidden />
							{product.productLikes}
						</span>
					</span>
				</div>
			</div>
		</article>
	);
};

export default ProductCard;
