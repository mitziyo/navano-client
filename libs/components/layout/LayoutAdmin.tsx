import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AdminMenuList from '../admin/AdminMenuList';
import NavanoLogo from '../common/NavanoLogo';
import { logOut } from '../../auth';
import { sessionReadyVar, userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import { sweetConfirmAlert } from '../../sweetAlert';
import useThemeMode from '../../hooks/useThemeMode';

// Breadcrumb of each admin route: section / page
const CRUMBS: Record<string, [string, string]> = {
	'/_admin': ['Dashboard', 'Overview'],
	'/_admin/users': ['Users', 'Member List'],
	'/_admin/products': ['Products', 'Product List'],
	'/_admin/community': ['Community', 'Article List'],
	'/_admin/cs/faq': ['CS', 'FAQ Management'],
	'/_admin/cs/notice': ['CS', 'Notice Management'],
	'/_admin/cs/inquiry': ['CS', '1:1 Inquiry'],
};

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const sessionReady = useReactiveVar(sessionReadyVar);
		const { mode, toggleMode } = useThemeMode();
		// Below 1024px the side rail slides in from the left
		const [asideOpen, setAsideOpen] = useState(false);

		/** LIFECYCLES **/
		useEffect(() => {
			if (sessionReady && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [sessionReady, user, router]);

		useEffect(() => {
			setAsideOpen(false);
		}, [router.asPath]);

		/** HANDLERS **/
		const logoutHandler = async () => {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		};

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		const [section, page] = CRUMBS[router.pathname] ?? ['Admin', ''];
		// updateUserInfo already puts the local placeholder path in memberImage when the member has no photo
		const image = user?.memberImage;
		const avatar = image && !image.startsWith('/') ? `${REACT_APP_API_URL}/${image}` : '/img/profile/defaultUser.svg';

		return (
			<>
				<Head>
					<title>{page ? `${page} · Navano Admin` : 'Navano Admin'}</title>
				</Head>
				<main id="admin-shell">
					<aside className={`admin-aside ${asideOpen ? 'is-open' : ''}`} id={'admin-aside'}>
						<Link href={'/'} className={'aside-brand'}>
							<NavanoLogo variant={'mark'} width={40} height={40} />
							<span>
								<strong>Navano</strong>
								<small>Admin console</small>
							</span>
						</Link>

						<div className={'aside-operator'}>
							<span className={'operator-avatar'}>
								<img src={avatar} alt="" />
								<span className={'online'} aria-hidden />
							</span>
							<span className={'operator-text'}>
								<strong>{user.memberNick}</strong>
								<small>{user.memberPhone}</small>
							</span>
							<span className={'operator-role'}>Admin</span>
						</div>

						<AdminMenuList />

						<div className={'aside-footer'}>
							<Link href={'/'} className={'aside-link'}>
								<OpenInNewIcon aria-hidden />
								Back to the site
							</Link>
							<button type="button" className={'aside-link danger'} onClick={logoutHandler}>
								<LogoutIcon aria-hidden />
								Logout
							</button>
						</div>
					</aside>

					{asideOpen && <div className={'aside-backdrop'} aria-hidden onClick={() => setAsideOpen(false)} />}

					<div className={'admin-main'}>
						<header className={'admin-topbar'}>
							<button
								type="button"
								className={'topbar-icon topbar-menu'}
								aria-label={'Open the admin menu'}
								aria-expanded={asideOpen}
								aria-controls={'admin-aside'}
								onClick={() => setAsideOpen(true)}
							>
								<MenuRoundedIcon />
							</button>
							<nav className={'topbar-crumbs'} aria-label={'breadcrumb'}>
								<span>Admin console</span>
								<span aria-hidden>/</span>
								<span>{section}</span>
								{page && (
									<>
										<span aria-hidden>/</span>
										<span className={'current'}>{page}</span>
									</>
								)}
							</nav>
							<div className={'topbar-actions'}>
								<Link href={'/'} target={'_blank'} className={'topbar-btn'}>
									<OpenInNewIcon aria-hidden />
									View site
								</Link>
								<button
									type="button"
									className={'topbar-icon'}
									aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
									onClick={toggleMode}
								>
									{mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
								</button>
							</div>
						</header>

						<div className={'admin-content'}>
							<Component {...props} />
						</div>
					</div>
				</main>
			</>
		);
	};
};

export default withAdminLayout;
