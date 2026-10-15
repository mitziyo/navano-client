import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import { toLabel } from './productLabels';

interface CommunityCardProps {
	article: BoardArticle;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { article } = props;
	const { t } = useTranslation('common');
	const articleImage = article?.articleImage ? `${REACT_APP_API_URL}/${article.articleImage}` : '/img/banner/community-hero.jpg';

	return (
		<Link
			href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}
			className={'community-row'}
		>
			<span className={'row-thumb'}>
				<img src={articleImage} alt="" loading="lazy" />
			</span>
			<span className={'row-body'}>
				<span className={'row-chip'}>{t(toLabel(article.articleCategory))}</span>
				<strong className={'row-title'}>{article.articleTitle}</strong>
				<span className={'row-meta'}>
					<span>{moment(article.createdAt).format('YY.MM.DD')}</span>
					<span aria-hidden>•</span>
					<span>{article.memberData?.memberNick}</span>
					<span className={'row-stats'}>
						<VisibilityOutlinedIcon aria-hidden />
						{article.articleViews}
						<FavoriteBorderIcon aria-hidden />
						{article.articleLikes}
					</span>
				</span>
			</span>
			<ArrowForwardIcon className={'row-arrow'} aria-hidden />
		</Link>
	);
};

export default CommunityCard;
