import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import TopAgentCard from './TopAgentCard';
import SectionHeading from './SectionHeading';
import { CardSkeletons, EmptyState } from './SectionState';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { GET_AGENTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	const { loading, data } = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
	});
	const topAgents: Member[] = data?.getAgents?.list ?? [];

	const canSlide = topAgents.length > 4;

	return (
		<section className={'home-section stores-section'} aria-labelledby="stores-title">
			<div className={'container'}>
				<SectionHeading
					id="stores-title"
					eyebrow={t('#03 Trusted stores')}
					title={t('Top Stores')}
					subtitle={t('Our top florists, bakers and chocolatiers are always ready to serve you')}
					action={
						<div className={'heading-actions'}>
							<Link href={'/agent'} className={'link-arrow'}>
								<span>{t('See all stores')}</span>
								<NorthEastIcon />
							</Link>
							{canSlide && (
								<>
									<button type="button" className={'round-btn swiper-stores-prev'} aria-label={t('Previous stores')}>
										<ChevronLeftIcon />
									</button>
									<button type="button" className={'round-btn swiper-stores-next'} aria-label={t('Next stores')}>
										<ChevronRightIcon />
									</button>
								</>
							)}
						</div>
					}
				/>
				{loading && topAgents.length === 0 ? (
					<CardSkeletons count={4} variant={'store'} />
				) : topAgents.length === 0 ? (
					<EmptyState title={t('No stores yet')} href={'/agent'} linkLabel={t('See all stores')} />
				) : (
					<Swiper
						className={'stores-swiper'}
						slidesPerView={4}
						slidesPerGroup={4}
						spaceBetween={24}
						modules={[Navigation]}
						navigation={{ nextEl: '.swiper-stores-next', prevEl: '.swiper-stores-prev' }}
					>
						{topAgents.map((agent: Member) => (
							<SwiperSlide key={agent._id}>
								<TopAgentCard agent={agent} />
							</SwiperSlide>
						))}
					</Swiper>
				)}
			</div>
		</section>
	);
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;
