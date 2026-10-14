import React, { FormEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import NavanoLogo from '../../libs/components/common/NavanoLogo';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { MemberType } from '../../libs/enums/member.enum';
import { Messages } from '../../libs/config';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

// What Navano offers, shown beside the form
const perks = [
	{ Icon: LocalFloristOutlinedIcon, title: 'Fresh flowers', text: 'Bouquets and arrangements from florists in your city' },
	{ Icon: CakeOutlinedIcon, title: 'Cakes & chocolates', text: 'Celebration cakes and handmade chocolates from local makers' },
	{ Icon: StorefrontOutlinedIcon, title: 'Sell on Navano', text: 'Open a store account, list your products and talk to customers directly' },
];

// Only same-site paths, so ?referrer= cannot send the user to another site
const safeReferrer = (value: unknown) => (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/');

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: MemberType.USER as string });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const user = useReactiveVar(userVar);

	const canSubmit = loginView ? !!input.nick && !!input.password : !!input.nick && !!input.password && !!input.phone;

	/** LIFECYCLES **/
	// A signed-in member (already, or right after submit) leaves the page
	useEffect(() => {
		if (router.isReady && user?._id) router.replace(safeReferrer(router.query.referrer));
	}, [router.isReady, user?._id]);

	/** HANDLERS **/
	const handleInput = (name: keyof typeof input, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	};

	const submitHandler = async (e: FormEvent) => {
		e.preventDefault();
		if (!canSubmit || submitting) return;
		setSubmitting(true);
		try {
			if (loginView) await logIn(input.nick, input.password);
			else await signUp(input.nick, input.password, input.phone, input.type);
		} catch (err: any) {
			// Server messages were already shown by the Apollo error link; only network failures need one here
			if (!err?.graphQLErrors?.length) await sweetMixinErrorAlert(Messages.error1);
		} finally {
			setSubmitting(false);
		}
	};

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	}

	return (
		<div id="join-page">
			<div className={'container'}>
				<div className={'join-panel'}>
					<section className={'join-form-side'}>
						<header className={'join-brand'}>
							<NavanoLogo variant={'mark'} width={40} height={40} />
							<div>
								<strong>Navano</strong>
								<small>{t('Flowers · Chocolates · Cakes')}</small>
							</div>
						</header>

						<div className={'join-title'}>
							<h1>{loginView ? t('Sign in') : t('Create account')}</h1>
							<p>
								{loginView
									? t('Sign in to follow stores, save favorites and manage your products')
									: t('Join Navano as a customer or open your own store')}
							</p>
						</div>

						<div className={'join-tabs'} role={'tablist'}>
							<button type="button" role={'tab'} aria-selected={loginView} className={loginView ? 'active' : ''} onClick={() => setLoginView(true)}>
								{t('Sign in')}
							</button>
							<button type="button" role={'tab'} aria-selected={!loginView} className={!loginView ? 'active' : ''} onClick={() => setLoginView(false)}>
								{t('Create account')}
							</button>
						</div>

						<form className={'join-form'} onSubmit={submitHandler}>
							<label className={'join-field'}>
								<span className={'field-label'}>{t('Nickname')}</span>
								<span className={'field-control'}>
									<PersonOutlineIcon aria-hidden />
									<input
										type="text"
										autoComplete="username"
										placeholder={t('Enter your nickname')}
										value={input.nick}
										onChange={(e) => handleInput('nick', e.target.value)}
									/>
								</span>
							</label>

							<label className={'join-field'}>
								<span className={'field-label'}>{t('Password')}</span>
								<span className={'field-control'}>
									<KeyOutlinedIcon aria-hidden />
									<input
										type={showPassword ? 'text' : 'password'}
										autoComplete={loginView ? 'current-password' : 'new-password'}
										placeholder={t('Enter your password')}
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
									/>
									<button
										type="button"
										className={'field-toggle'}
										aria-label={showPassword ? t('Hide password') : t('Show password')}
										onClick={() => setShowPassword((prev) => !prev)}
									>
										{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
									</button>
								</span>
							</label>

							{!loginView && (
								<>
									<label className={'join-field'}>
										<span className={'field-label'}>{t('Phone')}</span>
										<span className={'field-control'}>
											<PhoneOutlinedIcon aria-hidden />
											<input
												type="tel"
												autoComplete="tel"
												placeholder={t('Enter your phone number')}
												value={input.phone}
												onChange={(e) => handleInput('phone', e.target.value)}
											/>
										</span>
									</label>

									<div className={'join-field'}>
										<span className={'field-label'}>{t('I am joining as')}</span>
										<div className={'role-switch'} role={'radiogroup'}>
											{[
												{ value: MemberType.USER, label: 'Customer' },
												{ value: MemberType.AGENT, label: 'Store' },
											].map((role) => (
												<button
													type="button"
													key={role.value}
													role={'radio'}
													aria-checked={input.type === role.value}
													className={input.type === role.value ? 'active' : ''}
													onClick={() => handleInput('type', role.value)}
												>
													{t(role.label)}
												</button>
											))}
										</div>
									</div>
								</>
							)}

							<button type="submit" className={'join-submit'} disabled={!canSubmit || submitting} aria-busy={submitting}>
								{loginView ? t('Sign in') : t('Create account')}
								<NorthEastIcon aria-hidden />
							</button>
						</form>

						<p className={'join-switch'}>
							{loginView ? t('Not registered yet?') : t('Already have an account?')}
							<button type="button" onClick={() => setLoginView(!loginView)}>
								{loginView ? t('Create account') : t('Sign in')}
							</button>
						</p>
					</section>

					<aside className={'join-visual-side'}>
						<img className={'join-visual'} src={'/img/banner/join-daisy-vase.jpg'} alt="" aria-hidden />
						<div className={'join-visual-copy'}>
							<span className={'eyebrow'}>{t('Handmade by local stores')}</span>
							<h2>{t('Flowers, cakes & chocolates for every occasion')}</h2>
							<ul className={'join-perks'}>
								{perks.map(({ Icon, title, text }) => (
									<li key={title}>
										<span className={'perk-icon'}>
											<Icon aria-hidden />
										</span>
										<div>
											<strong>{t(title)}</strong>
											<p>{t(text)}</p>
										</div>
									</li>
								))}
							</ul>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(Join);
