import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ProductStatus } from '../../enums/product.enum';
import { useTranslation } from 'next-i18next';

// Shopper-facing status words, same as the product cards
const statusText = (status: string) =>
	status === ProductStatus.ACTIVE ? 'On sale' : status === ProductStatus.SOLD ? 'Sold out' : status === ProductStatus.HOLD ? 'On hold' : status;

interface ProductCardProps {
	product: Product;
	deleteProductHandler?: any;
	memberPage?: boolean;
	updateProductHandler?: any;
}

export const ProductCard = (props: ProductCardProps) => {
	const { product, deleteProductHandler, memberPage, updateProductHandler } = props;
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditProduct = async (id: string) => {
		console.log('+pushEditProduct: ', id);
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProduct', productId: id },
		});
	};

	const pushProductDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/product/detail',
				query: { id: id },
			});
		else return;
	};

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Stack className="product-card-box">
			<Stack className="image-box" onClick={() => pushProductDetail(product?._id)}>
				<img src={`${process.env.REACT_APP_API_URL}/${product.productImages[0]}`} alt="" />
			</Stack>
			<Stack className="information-box" onClick={() => pushProductDetail(product?._id)}>
				<Typography className="name">{product.productTitle}</Typography>
				<Typography className="address">{product.productAddress}</Typography>
				<Typography className="price">
					<strong>${formatterStr(product?.productPrice)}</strong>
				</Typography>
			</Stack>
			<Stack className="date-box">
				<Typography className="date">
					<Moment format="DD MMMM, YYYY">{product.createdAt}</Moment>
				</Typography>
			</Stack>
			<Stack className="status-box">
				<button
					type="button"
					className={`coloured-box status-${product.productStatus.toLowerCase()}`}
					onClick={handleClick}
					aria-haspopup={!memberPage && product.productStatus === 'ACTIVE' ? 'menu' : undefined}
				>
					<span className="status">{t(statusText(product.productStatus))}</span>
				</button>
			</Stack>
			{!memberPage && product.productStatus !== 'SOLD' && (
				<Menu
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					PaperProps={{
						elevation: 0,
						sx: {
							minWidth: '140px',
							mt: 1,
							ml: '10px',
							overflow: 'visible',
							filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
						},
						style: {
							padding: 0,
							display: 'flex',
							justifyContent: 'center',
						},
					}}
				>
					{product.productStatus === 'ACTIVE' && (
						<MenuItem
							disableRipple
							onClick={() => {
								handleClose();
								updateProductHandler(ProductStatus.SOLD, product?._id);
							}}
						>
							{t('Mark as sold out')}
						</MenuItem>
					)}
				</Menu>
			)}

			<Stack className="views-box">
				<Typography className="views">{product.productViews.toLocaleString()}</Typography>
			</Stack>
			{!memberPage && product.productStatus === ProductStatus.ACTIVE && (
				<Stack className="action-box">
					<IconButton className="icon-button" aria-label={t('Edit')} onClick={() => pushEditProduct(product._id)}>
						<ModeIcon className="buttons" />
					</IconButton>
					<IconButton className="icon-button delete" aria-label={t('Delete')} onClick={() => deleteProductHandler(product._id)}>
						<DeleteIcon className="buttons" />
					</IconButton>
				</Stack>
			)}
		</Stack>
	);
};
