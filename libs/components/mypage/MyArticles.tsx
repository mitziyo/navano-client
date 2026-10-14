import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ArticleCard from '../community/ArticleCard';
import MyPageHeader from './MyPageHeader';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: boardArticlesLoading,
		data: boardArticleData,
		error: getBoardArticleError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data.getBoardArticles?.list);
			setTotalCount(data.getBoardArticles?.metaCounter?.[0]?.total);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeBoardArticleHandler = async (e: any, user: T, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('succes', 800);
		} catch (err: any) {
			console.log('Error, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	} else
		return (
			<div className={'mp-tab'}>
				<MyPageHeader group={'Community'} title={'My Articles'} desc={'Your posts on the community boards'} actions={
						<Link
							href={{ pathname: '/mypage', query: { category: 'writeArticle' } }}
							scroll={false}
							className={'mp-btn mp-btn-primary'}
						>
							<EditNoteOutlinedIcon />
							<span>{t('Write Article')}</span>
						</Link>
					} />
				<section className={'mp-card'}>
					<div className={'card-head'}>
						<div className={'card-title'}>
							<ArticleOutlinedIcon aria-hidden />
							<h3>{t('Published articles')}</h3>
						</div>
						<span className={'card-tag'}>
							{(totalCount ?? 0)} {t('articles')}
						</span>
					</div>
					{boardArticles?.length ? (
						<div className={'mp-grid two'}>
							{boardArticles?.map((boardArticle: BoardArticle) => (
								<ArticleCard
									article={boardArticle}
									key={boardArticle?._id}
									// ArticleCard passes (user, article); the existing handler takes (event, user, id)
									likeArticleHandler={(current: any, article: BoardArticle) =>
										likeBoardArticleHandler({ stopPropagation: () => undefined }, current, article._id)
									}
								/>
							))}
						</div>
					) : (
						<div className={'mp-empty'}>
							<p>{t('You have not written any articles yet')}</p>
						</div>
					)}
					{boardArticles?.length ? (
						<footer className={'mp-pagination'}>
							<Pagination
								count={Math.ceil((totalCount ?? 0) / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="rounded"
								onChange={paginationHandler}
							/>
							<span>
								{(totalCount ?? 0)} {t('articles')}
							</span>
						</footer>
					) : null}
				</section>
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
