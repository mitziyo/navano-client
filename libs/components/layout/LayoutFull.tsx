import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutFull = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);

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

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					{user?._id && <Chat />}

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutFull;
