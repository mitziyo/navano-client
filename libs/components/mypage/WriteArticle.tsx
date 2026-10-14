import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import MyPageHeader from './MyPageHeader';
import dynamic from 'next/dynamic';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	} else
		return (
			<div id="write-article-page" className={'mp-tab'}>
				<MyPageHeader
					group={'Community'}
					title={'Write Article'}
					desc={'Share a bouquet you made, a cake you baked or a gift idea with the community'}
				/>
				<section className={'mp-card'}>
					<div className={'card-head'}>
						<div className={'card-title'}>
							<EditNoteOutlinedIcon aria-hidden />
							<h3>{t('New article')}</h3>
						</div>
						<span className={'card-tag'}>{t('Community')}</span>
					</div>
					<TuiEditor />
				</section>
			</div>
		);
};

export default WriteArticle;
