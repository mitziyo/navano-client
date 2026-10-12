import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import CommunityCard from './CommunityCard';
import { CardSkeletons, EmptyState } from './SectionState';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { BoardArticleCategory } from '../../enums/board-article.enum';

const tabs = [
	{ category: BoardArticleCategory.NEWS, label: 'News' },
	{ category: BoardArticleCategory.FREE, label: 'Free' },
];

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.NEWS);

	/** APOLLO REQUESTS **/
	// One request for the selected tab instead of loading both boards up front
	const { loading, data } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 4, sort: 'articleViews', direction: 'DESC', search: { articleCategory: category } },
		},
	});
	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];

	if (device === 'mobile') return null;

	return (
		<section className={'home-section community-section'} aria-labelledby="community-title">
			<div className={'container'}>
				<div className={'community-head'}>
					<h2 id="community-title">{t('Community Board Highlights')}</h2>
					<div className={'community-tabs'} role={'tablist'}>
						{tabs.map((tab) => (
							<button
								key={tab.category}
								type="button"
								role={'tab'}
								aria-selected={category === tab.category}
								className={category === tab.category ? 'active' : ''}
								onClick={() => setCategory(tab.category)}
							>
								<span>{t(tab.label)}</span>
								<ChevronRightIcon />
							</button>
						))}
					</div>
				</div>
				<div className={'community-list'} role={'tabpanel'}>
					{loading && articles.length === 0 ? (
						<CardSkeletons count={2} variant={'row'} />
					) : articles.length === 0 ? (
						<EmptyState
							title={t('No posts yet')}
							href={`/community?articleCategory=${category}`}
							linkLabel={t('Go to community')}
						/>
					) : (
						articles.map((article) => <CommunityCard article={article} key={article._id} />)
					)}
				</div>
				<div className={'community-more'}>
					<Link href={`/community?articleCategory=${category}`} className={'link-arrow'}>
						<span>{t('View all posts')}</span>
						<ChevronRightIcon />
					</Link>
				</div>
			</div>
		</section>
	);
};

export default CommunityBoards;
