import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { GET_MEMBER } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { memberRef, memberRoleLabel } from '../mypage/MyMenu';

interface MemberMenuProps {
	subscribeHandler: any;
	unsubscribeHandler: any;
}

const MemberMenu = (props: MemberMenuProps) => {
	const { subscribeHandler, unsubscribeHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const category: any = router.query?.category;
	const [member, setMember] = useState<Member | null>(null);
	const { memberId } = router.query;

	/** APOLLO REQUESTS **/
	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMember(data?.getMember);
		},
	});

	if (device === 'mobile') {
		return <div>MEMBER MENU MOBILE</div>;
	}

	const following = Boolean(member?.meFollowed && member?.meFollowed[0]?.myFollowing);
	const tabHref = (value: string) => ({ pathname: '/member', query: { ...router.query, category: value } });
	const items = [
		...(member?.memberType === 'AGENT'
			? [{ category: 'products', label: 'Products', icon: <StorefrontOutlinedIcon />, count: member?.memberProducts }]
			: []),
		{ category: 'followers', label: 'Followers', icon: <GroupOutlinedIcon />, count: member?.memberFollowers },
		{ category: 'followings', label: 'Followings', icon: <PersonAddAltOutlinedIcon />, count: member?.memberFollowings },
	];
	const renderLink = (item: { category: string; label: string; icon: React.ReactNode; count?: number }) => (
		<Link
			key={item.category}
			href={tabHref(item.category)}
			scroll={false}
			className={`side-link ${category === item.category ? 'active' : ''}`}
			aria-current={category === item.category ? 'page' : undefined}
		>
			{item.icon}
			<span>{t(item.label)}</span>
			<span className={'side-count'}>{item.count ?? 0}</span>
		</Link>
	);

	return (
		<nav className={'side-menu'} aria-label={t('Profile')}>
			<div className={'side-profile'}>
				<img
					src={member?.memberImage ? `${REACT_APP_API_URL}/${member?.memberImage}` : '/img/profile/defaultUser.svg'}
					alt={member?.memberNick ?? ''}
				/>
				<div>
					<strong>{member?.memberNick}</strong>
					<small>{t(memberRoleLabel(member?.memberType))}</small>
				</div>
			</div>

			<div className={'side-follow'}>
				{following ? (
					<button
						type="button"
						className={'side-btn ghost'}
						onClick={() => unsubscribeHandler(member?._id, getMemberRefetch, memberId)}
					>
						<HowToRegOutlinedIcon aria-hidden />
						{t('Following')}
						<span className={'hint'}>· {t('Unfollow')}</span>
					</button>
				) : (
					<button
						type="button"
						className={'side-btn primary'}
						onClick={() => subscribeHandler(member?._id, getMemberRefetch, memberId)}
					>
						<PersonAddAlt1Icon aria-hidden />
						{t('Follow')}
					</button>
				)}
			</div>

			<div className={'side-group'}>
				<span className={'side-group-title'}>{t('Details')}</span>
				{items.map(renderLink)}
			</div>
			<div className={'side-group'}>
				<span className={'side-group-title'}>{t('Community')}</span>
				{renderLink({ category: 'articles', label: 'Articles', icon: <ArticleOutlinedIcon />, count: member?.memberArticles })}
			</div>

			<div className={'side-footer'}>
				<span>ID: {memberRef(member?._id)}</span>
			</div>
		</nav>
	);
};

export default MemberMenu;
