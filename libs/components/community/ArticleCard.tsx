import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import { memberRoleLabel } from '../mypage/MyMenu';
import { boardLabel } from './boards';

interface ArticleCardProps {
	article: BoardArticle;
	likeArticleHandler: (user: any, article: BoardArticle) => void;
}

// Article bodies are editor HTML; cards show plain text
export const toPlainText = (html?: string) =>
	(html ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();

// About 200 words a minute, never less than one minute
const readMinutes = (text: string) => Math.max(1, Math.round(text.split(' ').filter(Boolean).length / 200));

const ArticleCard = ({ article, likeArticleHandler }: ArticleCardProps) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const author = article.memberData;
	const cover = article.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '/img/community/communityImg.png';
	const avatar = author?.memberImage ? `${REACT_APP_API_URL}/${author.memberImage}` : '/img/profile/defaultUser.svg';
	const excerpt = toPlainText(article.articleContent);
	const liked = Boolean(article.meLiked?.[0]?.myFavorite);
	const authorHref = author?._id === user?._id ? '/mypage' : `/member?memberId=${author?._id}`;
	// "Hannam-dong, Yongsan-gu, Seoul" -> "Hannam-dong"
	const place = author?.memberAddress?.split(',')[0]?.trim();

	return (
		<article className={'article-card'}>
			<Link
				href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`}
				className={'article-link'}
				aria-label={article.articleTitle}
			/>
			<div className={'article-media'}>
				<img src={cover} alt="" loading="lazy" />
				<span className={'article-board'}>{t(boardLabel(article.articleCategory))}</span>
				<span className={'article-date'}>
					<small>{moment(article.createdAt).format('MMMM')}</small>
					<strong>{moment(article.createdAt).format('DD')}</strong>
				</span>
			</div>
			<div className={'article-body'}>
				<div>
					<p className={'article-meta'}>
						<ScheduleIcon aria-hidden />
						<span>
							{readMinutes(excerpt)} {t('min read')}
						</span>
						{place && (
							<>
								<span aria-hidden>•</span>
								<span>{place}</span>
							</>
						)}
					</p>
					<h3>{article.articleTitle}</h3>
					{excerpt && <p className={'article-excerpt'}>{excerpt}</p>}
				</div>
				<footer className={'article-footer'}>
					<Link href={authorHref} className={'article-author'}>
						<img src={avatar} alt="" />
						<span>
							<strong>{author?.memberFullName || author?.memberNick}</strong>
							<small>{t(memberRoleLabel(author?.memberType))}</small>
						</span>
					</Link>
					<div className={'article-stats'}>
						<span>
							<VisibilityOutlinedIcon aria-hidden />
							{article.articleViews.toLocaleString()}
						</span>
						<button
							type="button"
							className={`article-like ${liked ? 'on' : ''}`}
							aria-pressed={liked}
							aria-label={liked ? t('Unlike') : t('Like')}
							onClick={() => likeArticleHandler(user, article)}
						>
							{liked ? <FavoriteIcon aria-hidden /> : <FavoriteBorderIcon aria-hidden />}
							{article.articleLikes.toLocaleString()}
						</button>
					</div>
				</footer>
			</div>
		</article>
	);
};

export default ArticleCard;
