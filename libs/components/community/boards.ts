import { BoardArticleCategory } from '../../enums/board-article.enum';

// UI names and blurbs of the community boards; the enum values stay as they are
export const BOARDS: { value: BoardArticleCategory; label: string; desc: string }[] = [
	{
		value: BoardArticleCategory.FREE,
		label: 'Free Board',
		desc: 'Talk about anything — bouquets you made, cakes you tried, gifts that worked',
	},
	{
		value: BoardArticleCategory.RECOMMEND,
		label: 'Recommendation',
		desc: 'Stores, products and gift ideas members recommend',
	},
	{
		value: BoardArticleCategory.NEWS,
		label: 'News',
		desc: 'Seasonal flowers, new menus and store announcements',
	},
	{
		value: BoardArticleCategory.HUMOR,
		label: 'Humor',
		desc: 'Funny moments from florists, bakers, chocolatiers and their customers',
	},
];

export const boardLabel = (value?: string) => BOARDS.find((board) => board.value === value)?.label ?? 'Free Board';
