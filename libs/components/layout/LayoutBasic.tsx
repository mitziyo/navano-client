import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Pages that render their own header instead of the photo banner
const PAGES_WITHOUT_BANNER = ['/about', '/product', '/agent', '/agent/detail', '/member', '/community', '/community/detail', '/cs', '/account/join'];

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/product':
					title = 'Product Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/properties.png';
					break;
				case '/agent':
					title = 'Agents';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/agents.webp';
					break;
				case '/agent/detail':
					title = 'Agent Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/mypage':
					title = 'My Page';
					desc = 'Your profile, products, favorites and articles in one place';
					bgImage = '/img/banner/stores-hero.jpg';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/cs':
					title = 'CS';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header1.svg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Navano</title>
						<meta name={'title'} content={`Navano`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Navano</title>
						<meta name={'title'} content={`Navano`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{!PAGES_WITHOUT_BANNER.includes(router.pathname) && (
							<section className={'header-basic'}>
								<div className={'header-basic-media'} aria-hidden>
									<img src={memoizedValues.bgImage} alt="" />
								</div>
								<div className={'container'}>
									<div className={'header-basic-copy'}>
										<h1>{t(memoizedValues.title)}</h1>
										<p>{t(memoizedValues.desc)}</p>
									</div>
								</div>
							</section>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
