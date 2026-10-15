import { Product } from '../product/product';

export type AssistantRole = 'user' | 'assistant';

export interface AssistantTurn {
	role: AssistantRole;
	text: string;
}

export interface AssistantInput {
	messages: AssistantTurn[];
}

export type AssistantProduct = Pick<
	Product,
	'_id' | 'productType' | 'productStatus' | 'productLocation' | 'productOccasion' | 'productTitle' | 'productPrice' | 'productImages'
>;

export interface AssistantReply {
	text: string;
	products: AssistantProduct[];
}

// One bubble in the panel; products only on assistant replies
export interface AssistantMessage extends AssistantTurn {
	id: string;
	products?: AssistantProduct[];
	error?: boolean;
}
