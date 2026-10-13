// CS content. The backend has no Notice/FAQ API yet (Notice.model.ts is not wired to a module),
// so notices and FAQs live here until one exists. Every string is an i18n key.

export type NoticeCategory = 'EVENT' | 'POLICY' | 'UPDATE';

export interface NoticeItem {
	id: number;
	category: NoticeCategory;
	title: string;
	summary: string;
	team: string;
	date: string; // YYYY-MM-DD
	href?: string;
}

export const NOTICE_CATEGORIES: { value: NoticeCategory; label: string }[] = [
	{ value: 'EVENT', label: 'Events' },
	{ value: 'POLICY', label: 'Policy' },
	{ value: 'UPDATE', label: 'Updates' },
];

// Newest first; the number column counts down like a board
export const NOTICES: NoticeItem[] = [
	{
		id: 6,
		category: 'UPDATE',
		title: 'Store profiles now show covers, cities and categories',
		summary: 'Browse the Stores directory by city or category and see each store’s cover photo, products and likes.',
		team: 'Navano Team',
		date: '2026-10-13',
		href: '/agent',
	},
	{
		id: 5,
		category: 'UPDATE',
		title: 'Community boards are open',
		summary: 'Share what you made, ask the makers and find gift ideas on the Free, Recommendation, News and Humor boards.',
		team: 'Community Team',
		date: '2026-10-13',
		href: '/community?articleCategory=FREE',
	},
	{
		id: 4,
		category: 'UPDATE',
		title: 'Shop by occasion — Birthday, Wedding, Anniversary and Holiday',
		summary: 'Every product now has an occasion, so you can filter the catalog and the home search by the event you are shopping for.',
		team: 'Navano Team',
		date: '2026-10-11',
		href: '/product',
	},
	{
		id: 3,
		category: 'POLICY',
		title: 'Report a problem with a store or product',
		summary: 'If a product is not as described, call customer care with the store name and product link and we will follow up with the store.',
		team: 'Customer Care',
		date: '2026-09-20',
	},
	{
		id: 2,
		category: 'POLICY',
		title: 'It’s absolutely free to upload and trade products',
		summary: 'Stores pay no listing fee — florists, bakers and chocolatiers can list as many products as they like.',
		team: 'Store Partnerships',
		date: '2024-03-31',
	},
	{
		id: 1,
		category: 'EVENT',
		title: 'Register to use and get discounts',
		summary: 'Create a free account to like products, follow stores and get member discounts from participating stores.',
		team: 'Navano Team',
		date: '2024-03-01',
		href: '/account/join',
	},
];

export type FaqCategory = 'PRODUCTS' | 'BUYERS' | 'STORES' | 'ACCOUNT' | 'COMMUNITY';

export const FAQ_CATEGORIES: { value: FaqCategory; label: string }[] = [
	{ value: 'PRODUCTS', label: 'Products' },
	{ value: 'BUYERS', label: 'For buyers' },
	{ value: 'STORES', label: 'For stores' },
	{ value: 'ACCOUNT', label: 'Account' },
	{ value: 'COMMUNITY', label: 'Community' },
];

export const FAQS: { id: string; category: FaqCategory; question: string; answer: string }[] = [
	{
		id: 'what-to-buy',
		category: 'PRODUCTS',
		question: 'What can I buy on Navano?',
		answer: 'Flowers, chocolates and cakes made by independent local stores. Each product shows its type, occasion, city and how many items are available.',
	},
	{
		id: 'up-to-date',
		category: 'PRODUCTS',
		question: 'Are the products up to date?',
		answer: 'Stores manage their own listings. Products on hold or sold out are marked on the card, and deleted products disappear from search.',
	},
	{
		id: 'gift-for-event',
		category: 'PRODUCTS',
		question: 'How do I find a gift for a specific event?',
		answer: 'Use the occasion filter (Birthday, Wedding, Anniversary, Holiday) in the home search or on the Products page, and combine it with a city and a category.',
	},
	{
		id: 'contact-store',
		category: 'BUYERS',
		question: 'How do I contact a store?',
		answer: 'Open the store page from the Stores directory or from a product, and use the contact details or comments there.',
	},
	{
		id: 'save-products',
		category: 'BUYERS',
		question: 'How do I save products I like?',
		answer: 'Tap the heart on a product. Liked products appear under My Favorites on My Page, and products you opened appear under Recently Visited.',
	},
	{
		id: 'buyer-fee',
		category: 'BUYERS',
		question: 'Is there a fee for buyers?',
		answer: 'No. Browsing products, liking them and following stores on Navano is free.',
	},
	{
		id: 'open-store',
		category: 'STORES',
		question: 'How do I open a store?',
		answer: 'Sign up and choose the Store role. After you log in, use Add Product on My Page to list your bouquets, cakes or chocolates.',
	},
	{
		id: 'listing-fee',
		category: 'STORES',
		question: 'Does it cost anything to list products?',
		answer: 'No, listing products on Navano is free.',
	},
	{
		id: 'sold-out',
		category: 'STORES',
		question: 'How do I mark a product as sold out or on hold?',
		answer: 'Go to My Products on My Page and change the product status. Buyers see an “On hold” or “Sold out” label on the card.',
	},
	{
		id: 'edit-profile',
		category: 'ACCOUNT',
		question: 'How do I change my photo or address?',
		answer: 'Open My Page, then My Profile, update the fields and press Update profile.',
	},
	{
		id: 'forgot-password',
		category: 'ACCOUNT',
		question: 'I forgot my password. What should I do?',
		answer: 'Call customer care and we will help you get back into your account.',
	},
	{
		id: 'who-can-write',
		category: 'COMMUNITY',
		question: 'Who can write in the community?',
		answer: 'Any logged-in member can write articles on the Free, Recommendation, News and Humor boards and comment on posts.',
	},
	{
		id: 'not-allowed',
		category: 'COMMUNITY',
		question: 'What is not allowed in the community?',
		answer: 'Spam, advertising that has nothing to do with flowers, cakes or chocolates, and personal attacks. Administrators can remove such posts.',
	},
];

export const CS_PHONE = '+82 10 4867 2909';
export const CS_PHONE_HREF = 'tel:+821048672909';
