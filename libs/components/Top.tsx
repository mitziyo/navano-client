import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import NavanoLogo from './common/NavanoLogo';
import { motion, MotionConfig } from 'framer-motion';

const glassSpring = { type: 'spring' as const, stiffness: 380, damping: 32 };

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [hoveredLink, setHoveredLink] = useState<string | null>(null);

	const navLinks = [
		{ href: '/', label: t('Home'), match: '/' },
		{ href: '/product', label: t('Products'), match: '/product' },
		{ href: '/agent', label: t('Agents'), match: '/agent' },
		{ href: '/community?articleCategory=FREE', label: t('Community'), match: '/community' },
		...(user?._id ? [{ href: '/mypage', label: t('My Page'), match: '/mypage' }] : []),
		{ href: '/cs', label: t('CS'), match: '/cs' },
	];

	const isActiveLink = (match: string) => (match === '/' ? router.pathname === '/' : router.pathname.startsWith(match));

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/product/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

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
	} else {
		return (
			<MotionConfig reducedMotion="user">
				<Stack className={'navbar'}>
					<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
						<motion.div
							className={'container nav-glass'}
							initial={{ y: -24, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={glassSpring}
						>
							<Box component={'div'} className={'logo-box'}>
								<Link href={'/'}>
									<NavanoLogo width={128} height={52} />
								</Link>
							</Box>
							<Box component={'div'} className={'router-box'} onMouseLeave={() => setHoveredLink(null)}>
								{navLinks.map((link) => {
									const active = isActiveLink(link.match);
									return (
										<Link href={link.href} key={link.href}>
											<div
												className={`nav-link ${active ? 'active' : ''}`}
												onMouseEnter={() => setHoveredLink(link.href)}
											>
												{active && (
													<motion.span layoutId="nav-glass-pill" className={'nav-pill'} transition={glassSpring} />
												)}
												{!active && hoveredLink === link.href && (
													<motion.span
														layoutId="nav-glass-hover"
														className={'nav-hover'}
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={glassSpring}
													/>
												)}
												<span className={'nav-label'}>{link.label}</span>
											</div>
										</Link>
									);
								})}
							</Box>
							<Box component={'div'} className={'user-box'}>
								{user?._id ? (
									<>
										<motion.div
											className={'login-user'}
											whileHover={{ scale: 1.06 }}
											whileTap={{ scale: 0.95 }}
											onClick={(event: any) => setLogoutAnchor(event.currentTarget)}
										>
											<img
												src={
													user?.memberImage
														? `${REACT_APP_API_URL}/${user?.memberImage}`
														: '/img/profile/defaultUser.svg'
												}
												alt=""
											/>
										</motion.div>

										<Menu
											id="basic-menu"
											anchorEl={logoutAnchor}
											open={logoutOpen}
											onClose={() => {
												setLogoutAnchor(null);
											}}
											sx={{ mt: '5px' }}
										>
											<MenuItem onClick={() => logOut()}>
												<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
												Logout
											</MenuItem>
										</Menu>
									</>
								) : (
									<Link href={'/account/join'}>
										<motion.div className={'join-box'} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
											<AccountCircleOutlinedIcon />
											<span>
												{t('Login')} / {t('Register')}
											</span>
										</motion.div>
									</Link>
								)}

								<div className={'lan-box'}>
									{user?._id && <NotificationsOutlinedIcon className={'notification-icon'} />}
									<Button
										disableRipple
										className="btn-lang"
										onClick={langClick}
										endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
									>
										<Box component={'div'} className={'flag'}>
											{lang !== null ? (
												<img src={`/img/flag/lang${lang}.png`} alt={'usaFlag'} />
											) : (
												<img src={`/img/flag/langen.png`} alt={'usaFlag'} />
											)}
										</Box>
									</Button>

									<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
										<MenuItem disableRipple onClick={langChoice} id="en">
											<img
												className="img-flag"
												src={'/img/flag/langen.png'}
												onClick={langChoice}
												id="en"
												alt={'usaFlag'}
											/>
											{t('English')}
										</MenuItem>
										<MenuItem disableRipple onClick={langChoice} id="kr">
											<img
												className="img-flag"
												src={'/img/flag/langkr.png'}
												onClick={langChoice}
												id="uz"
												alt={'koreanFlag'}
											/>
											{t('Korean')}
										</MenuItem>
										<MenuItem disableRipple onClick={langChoice} id="ru">
											<img
												className="img-flag"
												src={'/img/flag/langru.png'}
												onClick={langChoice}
												id="ru"
												alt={'russiaFlag'}
											/>
											{t('Russian')}
										</MenuItem>
									</StyledMenu>
								</div>
							</Box>
						</motion.div>
					</Stack>
				</Stack>
			</MotionConfig>
		);
	}
};

export default withRouter(Top);
