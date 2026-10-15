import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import 'moment/locale/ko';
import 'moment/locale/ru';
import { useTranslation } from 'next-i18next';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import Menu from '@mui/material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS } from '../../../apollo/user/query';
import { READ_ALL_NOTIFICATIONS, READ_NOTIFICATIONS } from '../../../apollo/user/mutation';
import { Notification, Notifications } from '../../types/notification/notification';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { REACT_APP_API_URL } from '../../config';

const POLL_MS = 30_000;

// Loading a moment locale also switches the global locale; keep the app default and pick per date below
moment.locale('en');

// Sentence template (an i18n key with {{nick}} / {{title}}) for each kind of notification
const sentenceKey = (item: Notification): string => {
	if (item.notificationType === NotificationType.FOLLOW) return '{{nick}} started following you';
	if (item.notificationType === NotificationType.LIKE) {
		if (item.notificationGroup === NotificationGroup.PRODUCT) return '{{nick}} liked your product “{{title}}”';
		if (item.notificationGroup === NotificationGroup.ARTICLE) return '{{nick}} liked your article “{{title}}”';
		return '{{nick}} liked your profile';
	}
	if (item.notificationGroup === NotificationGroup.PRODUCT) return '{{nick}} commented on your product “{{title}}”';
	if (item.notificationGroup === NotificationGroup.ARTICLE) return '{{nick}} commented on your article “{{title}}”';
	return '{{nick}} left a comment on your profile';
};

const targetHref = (item: Notification): string => {
	if (item.productId) return `/product/detail?id=${item.productId}`;
	if (item.articleId) return `/community/detail?articleCategory=FREE&id=${item.articleId}`;
	return `/member?memberId=${item.authorId}`;
};

// Navbar bell: unread count polled every 30 s while the tab is visible, list loaded when opened
const NotificationBell = ({ menuSx }: { menuSx: object }) => {
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	/** APOLLO REQUESTS **/
	const unread = useQuery<{ getUnreadNotifications: number }>(GET_UNREAD_NOTIFICATIONS, {
		pollInterval: POLL_MS,
		fetchPolicy: 'cache-and-network',
	});
	const [loadList, list] = useLazyQuery<{ getNotifications: Notifications }>(GET_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
	});
	const [readNotifications] = useMutation(READ_NOTIFICATIONS);
	const [readAllNotifications] = useMutation(READ_ALL_NOTIFICATIONS);
	const count = unread.data?.getUnreadNotifications ?? 0;
	const items = list.data?.getNotifications?.list ?? [];

	/** LIFECYCLES **/
	// No polling while the tab is in the background
	useEffect(() => {
		const { startPolling, stopPolling } = unread;
		const onVisibility = () => (document.hidden ? stopPolling() : startPolling(POLL_MS));
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, [unread.startPolling, unread.stopPolling]);

	/** HANDLERS **/
	const openHandler = (e: React.MouseEvent<HTMLElement>) => {
		setAnchor(e.currentTarget);
		loadList({ variables: { input: { page: 1, limit: 10 } } });
	};

	const refresh = async () => {
		await Promise.all([unread.refetch(), list.refetch?.()]);
	};

	const itemHandler = async (item: Notification) => {
		setAnchor(null);
		if (item.notificationStatus === NotificationStatus.WAIT) {
			await readNotifications({ variables: { input: { ids: [item._id] } } }).catch(() => undefined);
			unread.refetch();
		}
		await router.push(targetHref(item));
	};

	const readAllHandler = async () => {
		await readAllNotifications().catch(() => undefined);
		await refresh();
	};

	const avatar = (image?: string) => (image ? `${REACT_APP_API_URL}/${image}` : '/img/profile/defaultUser.svg');
	const timeLocale = i18n.language === 'kr' ? 'ko' : i18n.language;

	return (
		<>
			<button
				type="button"
				className={'icon-btn bell-btn'}
				aria-label={count ? `${t('Notifications')} (${count})` : t('Notifications')}
				aria-haspopup="menu"
				aria-expanded={Boolean(anchor)}
				onClick={openHandler}
			>
				<NotificationsOutlinedIcon />
				{count > 0 && <span className={'bell-badge'}>{count > 99 ? '99+' : count}</span>}
			</button>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				sx={menuSx}
				MenuListProps={{ className: 'bell-menu', 'aria-label': t('Notifications') }}
			>
				<div className={'bell-head'}>
					<strong>{t('Notifications')}</strong>
					{count > 0 && (
						<button type="button" onClick={readAllHandler}>
							<DoneAllRoundedIcon aria-hidden />
							{t('Mark all as read')}
						</button>
					)}
				</div>
				{items.length === 0 ? (
					<p className={'bell-empty'}>{list.loading ? t('Loading...') : t('No notifications yet')}</p>
				) : (
					items.map((item) => (
						<button
							type="button"
							key={item._id}
							role="menuitem"
							className={`bell-item ${item.notificationStatus === NotificationStatus.WAIT ? 'unread' : ''}`}
							onClick={() => itemHandler(item)}
						>
							<img src={avatar(item.authorData?.memberImage)} alt="" />
							<span className={'bell-text'}>
								<span>
									{t(sentenceKey(item), {
										nick: item.authorData?.memberNick ?? t('Someone'),
										title: item.notificationTitle,
										interpolation: { escapeValue: false },
									})}
								</span>
								{item.notificationDesc && <small className={'bell-quote'}>“{item.notificationDesc}”</small>}
								<small>{moment(item.createdAt).locale(timeLocale).fromNow()}</small>
							</span>
							{item.notificationStatus === NotificationStatus.WAIT && <span className={'bell-dot'} aria-hidden />}
						</button>
					))
				)}
			</Menu>
		</>
	);
};

export default NotificationBell;
