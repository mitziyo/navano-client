import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import SentimentVerySatisfiedOutlinedIcon from '@mui/icons-material/SentimentVerySatisfiedOutlined';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ArticleCard from '../../libs/components/community/ArticleCard';
import { BOARDS, boardLabel } from '../../libs/components/community/boards';
import { CardSkeletons } from '../../libs/components/homepage/SectionState';
import { memberRef, memberRoleLabel } from '../../libs/components/mypage/MyMenu';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { Direction } from '../../libs/enums/common.enum';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES, GET_MEMBER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PAGE_SIZE = 6;

const SORTS = [
	{ id: 'new', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'liked', label: 'Most liked', sort: 'articleLikes', direction: Direction.DESC },
	{ id: 'viewed', label: 'Most viewed', sort: 'articleViews', direction: Direction.DESC },
	{ id: 'old', label: 'Oldest', sort: 'createdAt', direction: Direction.ASC },
];

const BOARD_ICONS: Record<BoardArticleCategory, React.ReactNode> = {
	[BoardArticleCategory.FREE]: <ForumOutlinedIcon aria-hidden />,
	[BoardArticleCategory.RECOMMEND]: <ThumbUpAltOutlinedIcon aria-hidden />,
	[BoardArticleCategory.NEWS]: <NewspaperOutlinedIcon aria-hidden />,
	[BoardArticleCategory.HUMOR]: <SentimentVerySatisfiedOutlinedIcon aria-hidden />,
};

type CommunityQuery = { board: BoardArticleCategory; page: number; sortId: string; text: string };

// ?articleCategory=&page=&sort=&text= come from links and the address bar, so unknown values fall back to the defaults
const parseQuery = (query: Record<string, unknown>): CommunityQuery => {
	const board = BOARDS.find((item) => item.value === query.articleCategory)?.value ?? BoardArticleCategory.FREE;
	const sortId = SORTS.find((item) => item.id === query.sort)?.id ?? SORTS[0].id;
	return {
		board,
		page: Math.max(1, Number(query.page) || 1),
		sortId,
		text: typeof query.text === 'string' ? query.text : '',
	};
};

const Community: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const state = useMemo(() => parseQuery(router.query), [router.query]);
	const [searchText, setSearchText] = useState<string>('');

	const sortOption = SORTS.find((item) => item.id === state.sortId) ?? SORTS[0];
	const inquiry: BoardArticlesInquiry = {
		page: state.page,
		limit: PAGE_SIZE,
		sort: sortOption.sort,
		direction: sortOption.direction,
		search: { articleCategory: state.board, ...(state.text ? { text: state.text } : {}) },
	};

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading, data } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
		skip: !router.isReady,
	});
	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const total: number = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	const { data: memberData } = useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { input: user?._id },
		skip: !user?._id,
	});
	const me = memberData?.getMember;

	/** LIFECYCLES **/
	useEffect(() => {
		setSearchText(state.text);
	}, [state.text]);

	/** HANDLERS **/
	const pushQuery = async (next: Partial<CommunityQuery>) => {
		const merged = { ...state, ...next };
		const query: Record<string, string> = { articleCategory: merged.board };
		if (merged.page > 1) query.page = String(merged.page);
		if (merged.sortId !== SORTS[0].id) query.sort = merged.sortId;
		if (merged.text) query.text = merged.text;
		await router.push({ pathname: '/community', query }, undefined, { scroll: false });
	};

	// Board, search or sort changes start again from page 1
	const boardHandler = (board: BoardArticleCategory) => pushQuery({ board, page: 1, text: '' });
	const sortHandler = (sortId: string) => pushQuery({ sortId, page: 1 });
	const submitText = () => pushQuery({ text: searchText.trim(), page: 1 });

	const pageHandler = (_: unknown, page: number) => {
		pushQuery({ page });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const writeHandler = () => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });

	// The mutation returns the new articleLikes; the like state is flipped in the cache, so no list refetch
	const likeArticleHandler = async (current: any, article: BoardArticle) => {
		try {
			if (!article?._id) return;
			if (!current?._id) throw new Error(Messages.error2);
			const wasLiked = Boolean(article.meLiked?.[0]?.myFavorite);
			await likeTargetBoardArticle({
				variables: { input: article._id },
				update: (cache) => {
					cache.modify({
						id: cache.identify({ __typename: 'BoardArticle', _id: article._id }),
						fields: {
							meLiked: () =>
								wasLiked
									? []
									: [{ __typename: 'MeLiked', memberId: current._id, likeRefId: article._id, myFavorite: true }],
						},
					});
				},
			});
		} catch (err: any) {
			console.log('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	}

	const board = BOARDS.find((item) => item.value === state.board) ?? BOARDS[0];
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const from = total ? (state.page - 1) * PAGE_SIZE + 1 : 0;
	const to = Math.min(total, state.page * PAGE_SIZE);
	const avatar = me?.memberImage ? `${REACT_APP_API_URL}/${me.memberImage}` : '/img/profile/defaultUser.svg';

	return (
		<div id="community-list-page">
			<section className={'community-hero'}>
				<img className={'community-hero-media'} src={'/img/banner/community-hero.jpg'} alt="" aria-hidden />
				<div className={'container'}>
					<div className={'community-hero-copy'}>
						<nav className={'breadcrumb'} aria-label={'breadcrumb'}>
							<Link href={'/'}>{t('Home')}</Link>
							<span aria-hidden>/</span>
							<span>{t('Community')}</span>
							<span aria-hidden>/</span>
							<span className={'current'}>{t(board.label)}</span>
						</nav>
						<span className={'hero-badge'}>
							<span className={'pulse'} aria-hidden />
							{t('Stories from florists, bakers and chocolatiers')}
						</span>
						<h1>
							{t('Community &')} <em>{t('atelier stories')}</em>
						</h1>
						<p>{t('Share what you made, ask the makers and find gift ideas from people who love flowers and sweets')}</p>
					</div>
				</div>
			</section>

			<div className={'container'}>
				<div className={'community-layout'}>
					<aside className={'community-aside'}>
						<div className={'aside-card'}>
							<div className={'aside-brand'}>
								<span className={'brand-mark'}>
									<LocalFloristOutlinedIcon aria-hidden />
								</span>
								<div>
									<strong>{t('Navano Community')}</strong>
									<small>{t('Boards for makers and gift lovers')}</small>
								</div>
							</div>
							<nav className={'board-list'} aria-label={t('Boards')}>
								{BOARDS.map((item) => {
									const active = item.value === state.board;
									return (
										<button
											type="button"
											key={item.value}
											className={`board-link ${active ? 'active' : ''}`}
											aria-current={active ? 'page' : undefined}
											onClick={() => boardHandler(item.value)}
										>
											<span className={'board-name'}>
												{active ? <span className={'live-dot'} aria-hidden /> : BOARD_ICONS[item.value]}
												{t(item.label)}
											</span>
											{active && <span className={'board-count'}>{total}</span>}
										</button>
									);
								})}
							</nav>
							<div className={'aside-action'}>
								<button type="button" className={'publish-btn'} onClick={writeHandler}>
									<PostAddOutlinedIcon aria-hidden />
									{t('Write an article')}
								</button>
								<p>{t('Articles appear on the board as soon as you publish them')}</p>
							</div>
						</div>

						{me ? (
							<div className={'aside-card author-card'}>
								<Link href={'/mypage'} className={'author-head'}>
									<img src={avatar} alt="" />
									<div>
										<strong>
											{me.memberNick}
											<VerifiedIcon aria-hidden />
										</strong>
										<small>
											{t(memberRoleLabel(me.memberType))} · {memberRef(me._id)}
										</small>
									</div>
								</Link>
								<dl className={'author-stats'}>
									<div>
										<dt>{t('Articles')}</dt>
										<dd>{me.memberArticles ?? 0}</dd>
									</div>
									<div>
										<dt>{t('Likes')}</dt>
										<dd>{me.memberLikes ?? 0}</dd>
									</div>
								</dl>
							</div>
						) : (
							<div className={'aside-card guest-card'}>
								<strong>{t('Join the conversation')}</strong>
								<p>{t('Log in to write articles, comment and like posts')}</p>
								<Link href={'/account/join'} className={'guest-link'}>
									{t('Log in or sign up')}
									<ArrowForwardIcon aria-hidden />
								</Link>
							</div>
						)}
					</aside>

					<section className={'community-main'}>
						<header className={'board-header'}>
							<div>
								<div className={'board-title'}>
									<h2>{t(board.label)}</h2>
									<span className={'count-chip'}>
										{total} {t('articles')}
									</span>
								</div>
								<p>{t(board.desc)}</p>
							</div>
							<button type="button" className={'write-btn'} onClick={writeHandler}>
								<EditNoteOutlinedIcon aria-hidden />
								{t('Write')}
							</button>
						</header>

						<div className={'board-toolbar'}>
							<form
								className={'toolbar-search'}
								role={'search'}
								onSubmit={(e) => {
									e.preventDefault();
									submitText();
								}}
							>
								<SearchIcon aria-hidden />
								<input
									type="text"
									value={searchText}
									placeholder={t('Search article titles')}
									aria-label={t('Search article titles')}
									onChange={(e) => setSearchText(e.target.value)}
								/>
							</form>
							{state.text && (
								<button type="button" className={'filter-chip'} onClick={() => pushQuery({ text: '', page: 1 })}>
									<span>“{state.text}”</span>
									<CloseIcon aria-label={t('Remove filter')} />
								</button>
							)}
							<label className={'toolbar-select'}>
								<span className={'select-prefix'}>{t('Sort')}:</span>
								<select value={state.sortId} onChange={(e) => sortHandler(e.target.value)}>
									{SORTS.map((option) => (
										<option key={option.id} value={option.id}>
											{t(option.label)}
										</option>
									))}
								</select>
								<ExpandMoreIcon aria-hidden />
							</label>
						</div>

						{/* Server render and the first client render both show skeletons, so hydration matches */}
						{(!router.isReady || loading) && articles.length === 0 ? (
							<CardSkeletons count={4} />
						) : articles.length === 0 ? (
							<div className={'board-empty'}>
								<p>
									{state.text
										? t('No articles match this search')
										: t('No articles on {{board}} yet', { board: t(boardLabel(state.board)) })}
								</p>
								<button type="button" className={'reset-link'} onClick={writeHandler}>
									{t('Write the first one')}
								</button>
							</div>
						) : (
							<div className={'article-grid'}>
								{articles.map((article) => (
									<ArticleCard article={article} likeArticleHandler={likeArticleHandler} key={article._id} />
								))}
							</div>
						)}

						<section className={'share-banner'}>
							<div>
								<span className={'share-eyebrow'}>{t('Share your craft')}</span>
								<h3>{t('Show the community what you made')}</h3>
								<p>
									{t(
										'Post a bouquet you arranged, a cake you baked or a chocolate box you gifted, and tell others how you did it',
									)}
								</p>
							</div>
							<div className={'share-actions'}>
								<Link href={'/cs?tab=faq'} className={'share-btn ghost'}>
									{t('Community FAQ')}
								</Link>
								<button type="button" className={'share-btn primary'} onClick={writeHandler}>
									<span>{t('Write an article')}</span>
									<ArrowForwardIcon aria-hidden />
								</button>
							</div>
						</section>

						{total > 0 && (
							<footer className={'board-pagination'}>
								<Pagination
									page={Math.min(state.page, pageCount)}
									count={pageCount}
									onChange={pageHandler}
									shape="rounded"
								/>
								<p>
									{t('Total')} <strong>{total}</strong> {t('articles')} ({from}–{to})
								</p>
							</footer>
						)}
					</section>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(Community);
