import { ProductStatus } from '../../enums/product.enum';

// FLOWER -> Flower, SEOUL -> Seoul
export const toLabel = (value?: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : '');

// How many of what the buyer gets, in the words of each category
export const itemCountLabel = (type: string, count: number) => {
	switch (type) {
		case 'FLOWER':
			return `${count} ${count === 1 ? 'stem' : 'stems'}`;
		case 'CHOCOLATE':
			return `${count} ${count === 1 ? 'piece' : 'pieces'}`;
		case 'CAKE':
			return `${count} ${count === 1 ? 'cake' : 'cakes'}`;
		default:
			return `${count}`;
	}
};

// Shopper-facing wording for the product status (ACTIVE needs no badge)
export const statusLabel = (status?: string) => {
	switch (status) {
		case ProductStatus.HOLD:
			return 'On hold';
		case ProductStatus.SOLD:
			return 'Sold out';
		default:
			return '';
	}
};
