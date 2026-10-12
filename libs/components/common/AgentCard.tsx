import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';
import { memberRef } from '../mypage/MyMenu';

interface AgentCardProps {
	agent: Member;
	likeMemberHandler: (user: any, id: string) => void;
}

// 12400 -> 12.4k
const compact = (value = 0) => (value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`);

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const avatar = agent?.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : '/img/profile/defaultUser.svg';
	const cover = agent?.memberCover ? `${REACT_APP_API_URL}/${agent.memberCover}` : '';
	const detailHref = { pathname: '/agent/detail', query: { agentId: agent?._id } };
	const liked = Boolean(agent?.meLiked?.[0]?.myFavorite);
	const name = agent?.memberFullName || agent?.memberNick;

	if (device === 'mobile') {
		return <div>AGENT CARD</div>;
	}

	return (
		<article className="store-dir-card">
			<div className={`store-cover ${cover ? '' : 'empty'}`}>
				{cover && <img src={cover} alt="" loading="lazy" />}
				<span className={'cover-shade'} aria-hidden />
				<span className={'product-pill'}>
					{agent?.memberProducts ?? 0} {t('products')}
				</span>
				<span className={'ref-pill'}>{memberRef(agent?._id)}</span>
			</div>

			<div className={'store-body'}>
				<div className={'store-head'}>
					<Link href={detailHref} className={'store-portrait'} aria-label={name}>
						<img src={avatar} alt="" loading="lazy" />
						<span className={'portrait-check'} aria-hidden>
							<VerifiedIcon />
						</span>
					</Link>
					<div className={'store-score'}>
						<button
							type="button"
							className={`store-like ${liked ? 'liked' : ''}`}
							aria-pressed={liked}
							aria-label={liked ? `Unlike ${name}` : `Like ${name}`}
							onClick={() => likeMemberHandler(user, agent?._id)}
						>
							{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							<span>{agent?.memberLikes ?? 0}</span>
						</button>
						<span className={'store-reviews'}>
							{agent?.memberComments ?? 0} {t('reviews')}
						</span>
					</div>
				</div>

				<h3 className={'store-title'}>
					<Link href={detailHref}>{name}</Link>
				</h3>
				<p className={'store-handle'}>
					@{agent?.memberNick} · <span>{t('Store')}</span>
				</p>
				{agent?.memberAddress && (
					<p className={'store-address'}>
						<PlaceOutlinedIcon aria-hidden />
						<span>{agent.memberAddress}</span>
					</p>
				)}
				<p className={'store-desc'}>{agent?.memberDesc || t('This store has not added a description yet')}</p>

				<div className={'store-stats'}>
					<span aria-label={`${agent?.memberProducts ?? 0} ${t('products')}`}>
						<Inventory2OutlinedIcon aria-hidden />
						{agent?.memberProducts ?? 0} {t('items')}
					</span>
					<span aria-label={`${agent?.memberViews ?? 0} views`}>
						<VisibilityOutlinedIcon aria-hidden />
						{compact(agent?.memberViews)}
					</span>
					<span className={'likes'} aria-label={`${agent?.memberLikes ?? 0} likes`}>
						<FavoriteBorderIcon aria-hidden />
						{compact(agent?.memberLikes)}
					</span>
				</div>

				<div className={'store-actions'}>
					<Link href={detailHref} className={'store-btn ghost'}>
						<ChatBubbleOutlineIcon />
						<span>{t('Contact')}</span>
					</Link>
					<Link href={detailHref} className={'store-btn primary'}>
						<span>{t('Visit store')}</span>
						<ArrowForwardIcon />
					</Link>
				</div>
			</div>
		</article>
	);
};

export default AgentCard;
