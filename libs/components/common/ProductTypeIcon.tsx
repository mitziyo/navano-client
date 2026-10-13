import React from 'react';
import { SxProps } from '@mui/material';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import CookieOutlinedIcon from '@mui/icons-material/CookieOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import { ProductType } from '../../enums/product.enum';

// Flower / chocolate / cake icon for a product type (replaces the Nestar bed and room icons)
const ProductTypeIcon = ({ type, sx }: { type?: ProductType | string; sx?: SxProps }) => {
	if (type === ProductType.FLOWER) return <LocalFloristOutlinedIcon aria-hidden sx={sx} />;
	if (type === ProductType.CHOCOLATE) return <CookieOutlinedIcon aria-hidden sx={sx} />;
	return <CakeOutlinedIcon aria-hidden sx={sx} />;
};

export default ProductTypeIcon;
