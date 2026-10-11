import { ProductLocation, ProductOccasion, ProductStatus, ProductType } from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productLocation?: ProductLocation;
	productAddress?: string;
	productOccasion?: ProductOccasion;
	productTitle?: string;
	productPrice?: number;
	productItemCount?: number;
	productImages?: string[];
	productDesc?: string;
}
