import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';

interface TopAgentProps {
	agent: Member;
}

const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const { t } = useTranslation('common');
	const agentImage = agent?.memberImage ? `${REACT_APP_API_URL}/${agent?.memberImage}` : '/img/profile/defaultUser.svg';
	const detailHref = { pathname: '/agent/detail', query: { agentId: agent?._id } };

	return (
		<article className="store-card">
			<Link href={detailHref} className={'store-avatar'} aria-label={agent?.memberNick}>
				<img src={agentImage} alt="" loading="lazy" />
				<span className={'store-check'} aria-hidden>
					<VerifiedIcon />
				</span>
			</Link>
			<h3 className={'store-name'}>
				<Link href={detailHref}>{agent?.memberFullName || agent?.memberNick}</Link>
			</h3>
			<span className={'store-role'}>{t('Store')}</span>
			<p className={'store-meta'}>
				<span>
					{agent?.memberProducts ?? 0} {t('products')}
				</span>
				<span aria-hidden>•</span>
				<span>
					{agent?.memberLikes ?? 0} {t('likes')}
				</span>
			</p>
			<Link href={detailHref} className={'store-visit'}>
				{t('Visit store')}
			</Link>
		</article>
	);
};

export default TopAgentCard;
