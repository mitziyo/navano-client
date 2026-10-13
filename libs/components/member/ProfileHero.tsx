import React from 'react';
import { useTranslation } from 'next-i18next';
import VerifiedIcon from '@mui/icons-material/Verified';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { memberRef, memberRoleLabel } from '../mypage/MyMenu';

export interface ProfileMetric {
	label: string;
	value: React.ReactNode;
	note?: string;
}

interface ProfileHeroProps {
	member: Member | null | undefined;
	metrics: ProfileMetric[];
	actions?: React.ReactNode;
}

// Public profile header for stores (/agent/detail) and members (/member), same look as the My Profile hero
const ProfileHero = ({ member, metrics, actions }: ProfileHeroProps) => {
	const { t } = useTranslation('common');
	const avatar = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg';
	const cover = member?.memberCover ? `${REACT_APP_API_URL}/${member.memberCover}` : '';
	const roleLabel = t(memberRoleLabel(member?.memberType));

	return (
		<section className={'nv-hero'}>
			<div className={`hero-cover ${cover ? 'has-image' : ''}`}>
				{cover ? (
					<img src={cover} alt="" />
				) : (
					<span className={'hero-watermark'} aria-hidden>
						NAVANO
					</span>
				)}
				<span className={'cover-pill'}>
					<span className={'pulse'} aria-hidden />
					<span>{t('Navano member')}</span>
					<strong>{roleLabel}</strong>
				</span>
			</div>
			<div className={'hero-identity'}>
				<div className={'hero-left'}>
					<span className={'avatar-frame'}>
						<img src={avatar} alt={member?.memberNick ?? ''} />
					</span>
					<div className={'hero-text'}>
						<div className={'hero-name-row'}>
							<h1 className={'hero-name'}>{member?.memberFullName || member?.memberNick}</h1>
							<span className={'role-badge'}>
								<VerifiedIcon aria-hidden />
								{roleLabel}
							</span>
							<span className={'ref-chip'}>{memberRef(member?._id)}</span>
						</div>
						<p className={'hero-meta'}>
							<span className={'strong'}>
								<AlternateEmailIcon aria-hidden />
								{member?.memberNick}
							</span>
							{member?.memberPhone && (
								<>
									<span className={'dot'} aria-hidden>
										•
									</span>
									<a href={`tel:${member.memberPhone}`} className={'mono'}>
										<PhoneOutlinedIcon aria-hidden />
										{member.memberPhone}
									</a>
								</>
							)}
							{member?.memberAddress && (
								<>
									<span className={'dot'} aria-hidden>
										•
									</span>
									<span>
										<PlaceOutlinedIcon aria-hidden />
										{member.memberAddress}
									</span>
								</>
							)}
						</p>
					</div>
				</div>
				{actions && <div className={'hero-actions'}>{actions}</div>}
			</div>
			{member?.memberDesc && <p className={'hero-desc'}>{member.memberDesc}</p>}
			<dl className={'hero-metrics'} style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}>
				{metrics.map((metric) => (
					<div className={'metric'} key={metric.label}>
						<dt className={'metric-label'}>{metric.label}</dt>
						<dd className={'metric-value'}>{metric.value}</dd>
						{metric.note && <dd className={'metric-note'}>{metric.note}</dd>}
					</div>
				))}
			</dl>
		</section>
	);
};

export default ProfileHero;
