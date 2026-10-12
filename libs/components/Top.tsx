import React, { useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { Logout } from '@mui/icons-material';
import useDeviceDetect from '../hooks/useDeviceDetect';
import useThemeMode from '../hooks/useThemeMode';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../config';
import NavanoLogo from './common/NavanoLogo';
import { motion, MotionConfig } from 'framer-motion';

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
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string>('en');
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
	const [scrolled, setScrolled] = useState(false);
	const [hoveredLink, setHoveredLink] = useState<string | null>(null);
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
		const saved = localStorage.getItem('locale');
		if (saved === null) localStorage.setItem('locale', 'en');
		setLang(saved ?? 'en');
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	// One scroll listener for the lifetime of the navbar
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY >= 50);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	/** HANDLERS **/
	const langChoice = async (code: string) => {
		setLang(code);
		localStorage.setItem('locale', code);
		setLangAnchor(null);
		await router.push(router.asPath, router.asPath, { locale: code });
	};

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/product'}>
					<div>{t('Products')}</div>
				</Link>
				<Link href={'/agent'}>
					<div> {t('Agents')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
		);
	}

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
						{user?._id && (
							<button type="button" className={'icon-btn'} aria-label={t('Notifications')}>
								<NotificationsOutlinedIcon />
							</button>
						)}

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
					</div>
				</div>
			</header>
		</MotionConfig>
	);
};

export default withRouter(Top);
