import React, { useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { logOut } from '../auth';
import { Drawer } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { Logout } from '@mui/icons-material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useThemeMode from '../hooks/useThemeMode';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../config';
import NavanoLogo from './common/NavanoLogo';
import { motion, MotionConfig } from 'framer-motion';
import AssistantButton from './assistant/AssistantButton';
import NotificationBell from './common/NotificationBell';
import AssistantPanel from './assistant/AssistantPanel';

const glassSpring = { type: 'spring' as const, stiffness: 380, damping: 32 };

const LANGUAGES = [
	{ code: 'en', label: 'English', short: 'EN' },
	{ code: 'kr', label: 'Korean', short: 'KR' },
	{ code: 'ru', label: 'Russian', short: 'RU' },
];

const menuPaperSx = {
	mt: '8px',
	'& .MuiPaper-root': {
		minWidth: 168,
		borderRadius: '12px',
		border: '1px solid var(--nv-line-soft)',
		bgcolor: 'var(--nv-surface)',
		color: 'var(--nv-ink)',
		boxShadow: 'var(--nv-shadow-lg)',
	},
	'& .MuiMenuItem-root:hover, & .MuiMenuItem-root.Mui-selected': {
		bgcolor: 'var(--nv-primary-light)',
	},
};

const Top = () => {
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	// The URL decides the language (/kr, /ru); localStorage only remembers the last choice
	const lang = router.locale ?? 'en';
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
	const [scrolled, setScrolled] = useState(false);
	const [hoveredLink, setHoveredLink] = useState<string | null>(null);
	// Below 1024px the pill navigation moves into this side drawer
	const [drawerOpen, setDrawerOpen] = useState(false);
	const { mode, toggleMode } = useThemeMode();

	const navLinks = [
		{ href: '/', label: t('Home'), match: '/' },
		{ href: '/product', label: t('Products'), match: '/product' },
		{ href: '/agent', label: t('Agents'), match: '/agent' },
		{ href: '/community?articleCategory=FREE', label: t('Community'), match: '/community' },
		...(user?._id ? [{ href: '/mypage', label: t('My Page'), match: '/mypage' }] : []),
		{ href: '/cs', label: t('CS'), match: '/cs' },
	];

	const isActiveLink = (match: string) => (match === '/' ? router.pathname === '/' : router.pathname.startsWith(match));
	const currentLang = LANGUAGES.find((item) => item.code === lang) ?? LANGUAGES[0];

	/** LIFECYCLES **/
	useEffect(() => {
		localStorage.setItem('locale', lang);
	}, [lang]);

	// One scroll listener for the lifetime of the navbar
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY >= 50);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// Close the drawer after navigating
	useEffect(() => {
		setDrawerOpen(false);
	}, [router.asPath]);

	/** HANDLERS **/
	const langChoice = async (code: string) => {
		setLangAnchor(null);
		await router.push(router.asPath, router.asPath, { locale: code });
	};

	return (
		<MotionConfig reducedMotion="user">
			<header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
				<div className={'container navbar-inner'}>
					<Link href={'/'} className={'brand'} aria-label={'Navano home'}>
						<NavanoLogo variant={'mark'} width={40} height={40} />
						<span className={'brand-text'}>
							<strong>NAVANO</strong>
							<small>{t('Flowers · Chocolates · Cakes')}</small>
						</span>
					</Link>

					<nav className={'nav-pills'} aria-label={'Main'} onMouseLeave={() => setHoveredLink(null)}>
						{navLinks.map((link) => {
							const active = isActiveLink(link.match);
							return (
								<Link
									href={link.href}
									key={link.href}
									className={`nav-link ${active ? 'active' : ''}`}
									aria-current={active ? 'page' : undefined}
									onMouseEnter={() => setHoveredLink(link.href)}
								>
									{active && <motion.span layoutId="nav-active-pill" className={'nav-pill'} transition={glassSpring} />}
									{!active && hoveredLink === link.href && (
										<motion.span
											layoutId="nav-hover-pill"
											className={'nav-hover'}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={glassSpring}
										/>
									)}
									<span className={'nav-label'}>{link.label}</span>
								</Link>
							);
						})}
					</nav>

					<div className={'nav-actions'}>
						{user?._id && <NotificationBell menuSx={menuPaperSx} />}

						<button
							type="button"
							className={'icon-btn theme-btn'}
							onClick={toggleMode}
							aria-label={mode === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')}
							title={mode === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')}
						>
							{mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
						</button>

						<button
							type="button"
							className={'lang-btn'}
							aria-haspopup="menu"
							aria-expanded={Boolean(langAnchor)}
							onClick={(e) => setLangAnchor(e.currentTarget)}
						>
							<img src={`/img/flag/lang${currentLang.code}.png`} alt="" />
							<span>{currentLang.short}</span>
							<ExpandMoreIcon />
						</button>
						<Menu
							anchorEl={langAnchor}
							open={Boolean(langAnchor)}
							onClose={() => setLangAnchor(null)}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}
							sx={menuPaperSx}
						>
							{LANGUAGES.map((item) => (
								<MenuItem
									key={item.code}
									selected={item.code === lang}
									onClick={() => langChoice(item.code)}
									className={'lang-option'}
								>
									<img className="img-flag" src={`/img/flag/lang${item.code}.png`} alt="" />
									{t(item.label)}
								</MenuItem>
							))}
						</Menu>

						{user?._id ? (
							<>
								<button
									type="button"
									className={'avatar-btn'}
									aria-label={t('Account menu')}
									aria-haspopup="menu"
									aria-expanded={Boolean(userAnchor)}
									onClick={(e) => setUserAnchor(e.currentTarget)}
								>
									<img
										src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
										alt=""
									/>
									<span className={'online-dot'} aria-hidden />
								</button>
								<Menu
									anchorEl={userAnchor}
									open={Boolean(userAnchor)}
									onClose={() => setUserAnchor(null)}
									anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
									transformOrigin={{ vertical: 'top', horizontal: 'right' }}
									sx={menuPaperSx}
								>
									<MenuItem
										onClick={() => {
											setUserAnchor(null);
											router.push('/mypage');
										}}
									>
										<PersonOutlineIcon fontSize="small" style={{ marginRight: 10, color: 'var(--nv-primary)' }} />
										{t('My Page')}
									</MenuItem>
									<MenuItem onClick={() => logOut()}>
										<Logout fontSize="small" style={{ marginRight: 10, color: 'var(--nv-primary)' }} />
										{t('Logout')}
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href={'/account/join'} className={'join-btn'}>
								<AccountCircleOutlinedIcon />
								<span>
									{t('Login')} / {t('Register')}
								</span>
							</Link>
						)}

						<button
							type="button"
							className={'icon-btn menu-btn'}
							aria-label={t('Open menu')}
							aria-expanded={drawerOpen}
							aria-controls={'nav-drawer'}
							onClick={() => setDrawerOpen(true)}
						>
							<MenuRoundedIcon />
						</button>
					</div>
				</div>
			</header>

			<Drawer
				anchor={'right'}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				PaperProps={{ id: 'nav-drawer', className: 'nav-drawer' }}
			>
				<div className={'drawer-head'}>
					<NavanoLogo variant={'mark'} width={36} height={36} />
					<strong>NAVANO</strong>
					<button type="button" className={'drawer-close'} aria-label={t('Close')} onClick={() => setDrawerOpen(false)}>
						<CloseRoundedIcon />
					</button>
				</div>
				<nav className={'drawer-links'} aria-label={'Main'}>
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className={isActiveLink(link.match) ? 'active' : ''}
							aria-current={isActiveLink(link.match) ? 'page' : undefined}
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className={'drawer-section'}>
					<span className={'drawer-label'}>{t('Language')}</span>
					<div className={'drawer-langs'}>
						{LANGUAGES.map((item) => (
							<button
								type="button"
								key={item.code}
								className={item.code === lang ? 'active' : ''}
								aria-pressed={item.code === lang}
								onClick={() => langChoice(item.code)}
							>
								<img src={`/img/flag/lang${item.code}.png`} alt="" />
								{item.short}
							</button>
						))}
					</div>
				</div>
				<button type="button" className={'drawer-row'} onClick={toggleMode}>
					{mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
					{mode === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')}
				</button>
				{user?._id ? (
					<button type="button" className={'drawer-row'} onClick={() => logOut()}>
						<Logout />
						{t('Logout')}
					</button>
				) : (
					<Link href={'/account/join'} className={'drawer-row primary'}>
						<AccountCircleOutlinedIcon />
						{t('Login')} / {t('Register')}
					</Link>
				)}
			</Drawer>
			{/* Floating dock above the chat button (bottom-right) */}
			<AssistantButton />
			<AssistantPanel />
		</MotionConfig>
	);
};

export default withRouter(Top);
