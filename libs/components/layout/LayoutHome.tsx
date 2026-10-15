import React from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeroSection from '../homepage/HeroSection';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
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

					<HeroSection />

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

export default withLayoutMain;
