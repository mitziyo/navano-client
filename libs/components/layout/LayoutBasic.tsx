import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
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
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			// Only /mypage still uses this photo banner (see PAGES_WITHOUT_BANNER)
			if (router.pathname === '/mypage') {
				title = 'My Page';
				desc = 'Your profile, products, favorites and articles in one place';
				bgImage = '/img/banner/stores-hero.jpg';
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		/** HANDLERS **/

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
	};
};

export default withLayoutBasic;
