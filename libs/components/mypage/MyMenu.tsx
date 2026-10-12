import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { MemberType } from '../../enums/member.enum';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryIcon from '@mui/icons-material/History';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/** Short, display-only member reference, e.g. #NVN-4DE104 */
export const memberRef = (memberId?: string) => (memberId ? `#NVN-${memberId.slice(-6).toUpperCase()}` : '');

export const memberRoleLabel = (memberType?: string) => {
	if (memberType === MemberType.AGENT) return 'Store';
	if (memberType === MemberType.ADMIN) return 'Admin';
	return 'Customer';
};

interface MenuItem {
	category: string;
	label: string;
	icon: React.ReactNode;
}

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const listingItems: MenuItem[] = [
		...(user.memberType === MemberType.AGENT
			? [
					{ category: 'addProduct', label: 'Add Product', icon: <AddBoxOutlinedIcon /> },
					{ category: 'myProducts', label: 'My Products', icon: <Inventory2OutlinedIcon /> },
			  ]
			: []),
		{ category: 'myFavorites', label: 'My Favorites', icon: <FavoriteBorderIcon /> },
		{ category: 'recentlyVisited', label: 'Recently Visited', icon: <HistoryIcon /> },
		{ category: 'followers', label: 'My Followers', icon: <GroupOutlinedIcon /> },
		{ category: 'followings', label: 'My Followings', icon: <PersonAddAltOutlinedIcon /> },
	];
	const communityItems: MenuItem[] = [
		{ category: 'myArticles', label: 'Articles', icon: <ArticleOutlinedIcon /> },
		{ category: 'writeArticle', label: 'Write Article', icon: <EditNoteOutlinedIcon /> },
	];

	const renderItems = (items: MenuItem[]) =>
		items.map((item) => (
			<Link
				key={item.category}
				href={{ pathname: '/mypage', query: { category: item.category } }}
				scroll={false}
				className={`menu-link ${category === item.category ? 'active' : ''}`}
				aria-current={category === item.category ? 'page' : undefined}
			>
				{item.icon}
				<span>{t(item.label)}</span>
			</Link>
		));

	if (device === 'mobile') {
		return <div>MY MENU</div>;
	} else {
		return (
			<Stack className={'my-menu'}>
				<Stack className={'menu-profile'}>
					<Box component={'div'} className={'menu-avatar'}>
						<img
							src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
							alt={user?.memberNick ?? 'member'}
						/>
					</Box>
					<Stack className={'menu-identity'}>
						<Typography className={'menu-name'}>{user?.memberNick}</Typography>
						<Typography className={'menu-role'}>{t(memberRoleLabel(user?.memberType))}</Typography>
					</Stack>
				</Stack>

				<Stack className={'menu-group'}>
					<Typography className={'menu-group-title'}>{t('Manage Listings')}</Typography>
					{renderItems(listingItems)}
				</Stack>

				<Stack className={'menu-group'}>
					<Typography className={'menu-group-title'}>{t('Community')}</Typography>
					{renderItems(communityItems)}
				</Stack>

				<Stack className={'menu-group'}>
					<Typography className={'menu-group-title'}>{t('Manage Account')}</Typography>
					{renderItems([{ category: 'myProfile', label: 'My Profile', icon: <AccountCircleOutlinedIcon /> }])}
					{user?.memberType === MemberType.ADMIN && (
						<a href="/_admin/users" target={'_blank'} className={'menu-link'}>
							<AdminPanelSettingsOutlinedIcon />
							<span>{t('Admin Panel')}</span>
						</a>
					)}
				</Stack>

				<Stack className={'menu-footer'}>
					<Link href={'/cs'} className={'menu-link small'}>
						<HelpOutlineIcon />
						<span>{t('Help Center')}</span>
					</Link>
					<button type={'button'} className={'menu-link small menu-logout'} onClick={logoutHandler}>
						<LogoutIcon />
						<span>{t('Logout')}</span>
					</button>
					<span className={'menu-ref'}>ID: {memberRef(user?._id)}</span>
				</Stack>
			</Stack>
		);
	}
};

export default MyMenu;
