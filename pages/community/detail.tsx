import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import SentimentVerySatisfiedOutlinedIcon from '@mui/icons-material/SentimentVerySatisfiedOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import NavanoLogo from '../../libs/components/common/NavanoLogo';
import { BOARDS } from '../../libs/components/community/boards';
import { memberRef, memberRoleLabel } from '../../libs/components/mypage/MyMenu';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Direction } from '../../libs/enums/common.enum';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_COMMENTS, GET_MEMBER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const COMMENTS_PER_PAGE = 5;
const COMMENT_MAX = 100;

// Same icons as the board list on /community
const BOARD_ICONS: Record<BoardArticleCategory, React.ReactNode> = {
	[BoardArticleCategory.FREE]: <ForumOutlinedIcon aria-hidden />,
	[BoardArticleCategory.RECOMMEND]: <ThumbUpAltOutlinedIcon aria-hidden />,
	[BoardArticleCategory.NEWS]: <NewspaperOutlinedIcon aria-hidden />,
	[BoardArticleCategory.HUMOR]: <SentimentVerySatisfiedOutlinedIcon aria-hidden />,
};

const avatarUrl = (image?: string) => (image ? `${REACT_APP_API_URL}/${image}` : '/img/profile/defaultUser.svg');

const CommunityDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);

	const articleId = typeof router.query.id === 'string' ? router.query.id : '';
	const [commentPage, setCommentPage] = useState<number>(1);
	const [comment, setComment] = useState<string>('');
	const [editingId, setEditingId] = useState<string>('');
	const [editingText, setEditingText] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);

	const commentsInquiry: CommentsInquiry = {
		page: commentPage,
		limit: COMMENTS_PER_PAGE,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentRefId: articleId },
	};

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	const { data: articleData, refetch: articleRefetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: { input: articleId },
		skip: !articleId,
	});
	const article: BoardArticle | undefined = articleData?.getBoardArticle;

	const { data: commentsData, refetch: commentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentsInquiry },
		skip: !articleId,
	});
	const comments: Comment[] = commentsData?.getComments?.list ?? [];
	const total: number = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;

	const { data: memberData } = useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { input: user?._id },
		skip: !user?._id,
	});
	const me = memberData?.getMember;

	/** LIFECYCLES **/
	useEffect(() => {
		setCommentPage(1);
	}, [articleId]);

	/** HANDLERS **/
	const boardHandler = (board: BoardArticleCategory) => router.push({ pathname: '/community', query: { articleCategory: board } });
	const writeHandler = () => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } });
	const memberHref = (id?: string) => (id && id === user?._id ? '/mypage' : `/member?memberId=${id}`);

	const likeArticleHandler = async () => {
		try {
			if (likeLoading || !article?._id) return;
			if (!user?._id) throw new Error(Messages.error2);
			setLikeLoading(true);
			await likeTargetBoardArticle({ variables: { input: article._id } });
			await articleRefetch({ input: articleId });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setLikeLoading(false);
		}
	};

	const createCommentHandler = async () => {
		const content = comment.trim();
		if (!content) return;
		try {
			if (!user?._id) throw new Error(Messages.error2);
			const input: CommentInput = { commentGroup: CommentGroup.ARTICLE, commentRefId: articleId, commentContent: content };
			await createComment({ variables: { input } });
			setComment('');
			await Promise.all([commentsRefetch({ input: { ...commentsInquiry, page: 1 } }), articleRefetch({ input: articleId })]);
			setCommentPage(1);
			await sweetTopSmallSuccessAlert(t('Comment posted'), 800);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const saveCommentHandler = async (item: Comment) => {
		const content = editingText.trim();
		if (!content || content === item.commentContent) return setEditingId('');
		try {
			const input: CommentUpdate = { _id: item._id, commentContent: content };
			await updateComment({ variables: { input } });
			setEditingId('');
			await commentsRefetch({ input: commentsInquiry });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const deleteCommentHandler = async (item: Comment) => {
		try {
			if (!(await sweetConfirmAlert(t('Do you want to delete the comment?')))) return;
			const input: CommentUpdate = { _id: item._id, commentStatus: CommentStatus.DELETE };
			await updateComment({ variables: { input } });
			await Promise.all([commentsRefetch({ input: commentsInquiry }), articleRefetch({ input: articleId })]);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	if (device === 'mobile') {
		return <div>COMMUNITY DETAIL PAGE MOBILE</div>;
	}

	const board = BOARDS.find((item) => item.value === article?.articleCategory) ?? BOARDS[0];
	const author = article?.memberData;
	const liked = Boolean(article?.meLiked?.[0]?.myFavorite);
	const pageCount = Math.max(1, Math.ceil(total / COMMENTS_PER_PAGE));

	return (
		<div id="community-detail-page">
			<section className={'community-hero'}>
				<div className={'community-hero-media'} aria-hidden>
					<img src={'/img/banner/stores-hero.jpg'} alt="" />
				</div>
				<div className={'container'}>
					<div className={'community-hero-copy'}>
						<nav className={'breadcrumb'} aria-label={'breadcrumb'}>
							<Link href={'/'}>{t('Home')}</Link>
							<span aria-hidden>/</span>
							<Link href={'/community'}>{t('Community')}</Link>
							<span aria-hidden>/</span>
							<Link href={{ pathname: '/community', query: { articleCategory: board.value } }} className={'current'}>
								{t(board.label)}
							</Link>
						</nav>
						<span className={'hero-badge'}>
							<span className={'pulse'} aria-hidden />
							{t(board.label)}
						</span>
						<h1>{article?.articleTitle ?? ''}</h1>
						{article && (
							<div className={'article-meta'}>
								<Link href={memberHref(author?._id)} className={'meta-author'}>
									<img src={avatarUrl(author?.memberImage)} alt="" />
									<span>
										<strong>{author?.memberNick}</strong>
										<small>{t(memberRoleLabel(author?.memberType))}</small>
									</span>
								</Link>
								<span className={'meta-divider'} aria-hidden />
								<Moment className={'meta-date'} format={'DD.MM.YYYY HH:mm'}>
									{article.createdAt}
								</Moment>
								<span className={'meta-divider'} aria-hidden />
								<span className={'meta-stat'}>
									<VisibilityOutlinedIcon aria-hidden />
									{article.articleViews}
								</span>
								<span className={'meta-stat'}>
									<FavoriteBorderIcon aria-hidden />
									{article.articleLikes}
								</span>
								<span className={'meta-stat'}>
									<ChatBubbleOutlineRoundedIcon aria-hidden />
									{total}
								</span>
							</div>
						)}
					</div>
				</div>
			</section>

			<div className={'container'}>
				<div className={'community-layout'}>
					<aside className={'community-aside'}>
						<div className={'aside-card'}>
							<div className={'aside-brand'}>
								<NavanoLogo variant={'mark'} width={48} height={48} className={'brand-mark'} />
								<div>
									<strong>{t('Navano Community')}</strong>
									<small>{t('Boards for makers and gift lovers')}</small>
								</div>
							</div>
							<nav className={'board-list'} aria-label={t('Boards')}>
								{BOARDS.map((item) => {
									const active = item.value === board.value;
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
									<img src={avatarUrl(me.memberImage)} alt="" />
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
								</div>
								<p>{t(board.desc)}</p>
							</div>
							<button type="button" className={'write-btn'} onClick={writeHandler}>
								<EditNoteOutlinedIcon aria-hidden />
								{t('Write')}
							</button>
						</header>

						<article className={'article-panel'}>
							<div className={'article-body'}>
								{article?.articleContent ? <ToastViewerComponent markdown={article.articleContent} /> : null}
							</div>
							<footer className={'article-actions'}>
								<Link href={{ pathname: '/community', query: { articleCategory: board.value } }} className={'back-link'}>
									<ArrowBackIcon aria-hidden />
									{t('Back to {{board}}', { board: t(board.label) })}
								</Link>
								<button
									type="button"
									className={`like-btn ${liked ? 'on' : ''}`}
									aria-pressed={liked}
									disabled={likeLoading}
									onClick={likeArticleHandler}
								>
									{liked ? <FavoriteIcon aria-hidden /> : <FavoriteBorderIcon aria-hidden />}
									{liked ? t('Liked') : t('Like')}
									<span>{article?.articleLikes ?? 0}</span>
								</button>
							</footer>
						</article>

						<section className={'comments-panel'} aria-labelledby={'comments-title'}>
							<header className={'comments-head'}>
								<h3 id={'comments-title'}>{t('Comments')}</h3>
								<span className={'count-chip'}>{total}</span>
							</header>

							<form
								className={'comment-form'}
								onSubmit={(e) => {
									e.preventDefault();
									createCommentHandler();
								}}
							>
								<img src={avatarUrl(me?.memberImage)} alt="" />
								<div className={'comment-field'}>
									<input
										type="text"
										value={comment}
										maxLength={COMMENT_MAX}
										placeholder={user?._id ? t('Leave a comment') : t('Log in to write articles, comment and like posts')}
										aria-label={t('Leave a comment')}
										onChange={(e) => setComment(e.target.value)}
									/>
									<span className={'comment-count'}>
										{comment.length}/{COMMENT_MAX}
									</span>
								</div>
								<button type="submit" className={'write-btn'} disabled={!comment.trim()}>
									{t('Comment')}
								</button>
							</form>

							{comments.length === 0 ? (
								<p className={'comments-empty'}>{t('No comments yet. Be the first to reply')}</p>
							) : (
								<ul className={'comment-list'}>
									{comments.map((item) => {
										const mine = item.memberId === user?._id;
										const editing = editingId === item._id;
										return (
											<li key={item._id} className={'comment-item'}>
												<Link href={memberHref(item.memberData?._id)} className={'comment-avatar'}>
													<img src={avatarUrl(item.memberData?.memberImage)} alt="" />
												</Link>
												<div className={'comment-main'}>
													<div className={'comment-top'}>
														<Link href={memberHref(item.memberData?._id)} className={'comment-nick'}>
															{item.memberData?.memberNick}
														</Link>
														<Moment className={'comment-date'} format={'DD.MM.YYYY HH:mm'}>
															{item.createdAt}
														</Moment>
														{mine && !editing && (
															<span className={'comment-tools'}>
																<button
																	type="button"
																	aria-label={t('Edit')}
																	onClick={() => {
																		setEditingId(item._id);
																		setEditingText(item.commentContent);
																	}}
																>
																	<EditOutlinedIcon />
																</button>
																<button type="button" aria-label={t('Delete')} onClick={() => deleteCommentHandler(item)}>
																	<DeleteOutlineIcon />
																</button>
															</span>
														)}
													</div>
													{editing ? (
														<form
															className={'comment-edit'}
															onSubmit={(e) => {
																e.preventDefault();
																saveCommentHandler(item);
															}}
														>
															<input
																autoFocus
																type="text"
																value={editingText}
																maxLength={COMMENT_MAX}
																aria-label={t('Edit')}
																onChange={(e) => setEditingText(e.target.value)}
															/>
															<button type="button" className={'ghost-btn'} onClick={() => setEditingId('')}>
																{t('Cancel')}
															</button>
															<button type="submit" className={'write-btn'}>
																{t('Save')}
															</button>
														</form>
													) : (
														<p>{item.commentContent}</p>
													)}
												</div>
											</li>
										);
									})}
								</ul>
							)}

							{total > COMMENTS_PER_PAGE && (
								<footer className={'board-pagination'}>
									<Pagination
										page={Math.min(commentPage, pageCount)}
										count={pageCount}
										onChange={(_, page) => setCommentPage(page)}
										shape="rounded"
									/>
								</footer>
							)}
						</section>
					</section>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(CommunityDetail);
