import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import Inquiry from '../../libs/components/cs/Inquiry';
import { CS_PHONE, CS_PHONE_HREF, FAQ_CATEGORIES } from '../../libs/components/cs/csContent';
import { chatOpenVar } from '../../apollo/store';
import { GET_NOTICES } from '../../apollo/user/query';
import { Notices } from '../../libs/types/notice/notice';
import { NoticeCategory } from '../../libs/enums/notice.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type Tab = 'notice' | 'faq' | 'inquiry';
const TABS: Tab[] = ['notice', 'faq', 'inquiry'];

// Both lists are small, so the page loads them once and the panels filter and page on the client
const listInput = (noticeCategory: NoticeCategory) => ({ input: { page: 1, limit: 100, search: { noticeCategory } } });

const CS: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	// Footer and FAQ links use ?tab=notice|faq|inquiry; anything else falls back to notices
	const tab: Tab = TABS.includes(router.query.tab as Tab) ? (router.query.tab as Tab) : 'notice';

	/** APOLLO REQUESTS **/
	const notices = useQuery<{ getNotices: Notices }>(GET_NOTICES, { variables: listInput(NoticeCategory.NOTICE) });
	const faqs = useQuery<{ getNotices: Notices }>(GET_NOTICES, { variables: listInput(NoticeCategory.FAQ) });
	const noticeList = notices.data?.getNotices?.list ?? [];
	const faqList = faqs.data?.getNotices?.list ?? [];

	/** HANDLERS **/
	const changeTabHandler = (next: Tab) => {
		router.push({ pathname: '/cs', query: { tab: next } }, undefined, { scroll: false });
	};

	const openChat = () => chatOpenVar(true);


	return (
		<div id="cs-page">
			<section className={'cs-hero'}>
				<div className={'cs-hero-media'} aria-hidden>
					<img src={'/img/banner/stores-hero.jpg'} alt="" />
				</div>
				<div className={'container'}>
					<div className={'cs-hero-copy'}>
						<span className={'hero-badge'}>
							<span className={'pulse'} aria-hidden />
							{t('Help center')}
							<span aria-hidden>•</span>
							<strong>{t('Customer care')}</strong>
						</span>
						<h1>
							CS <em>/ {t('Help center')}</em>
						</h1>
						<p className={'hero-sub'}>{t('Customer support for buyers and stores')}</p>
						<p className={'hero-text'}>
							{t(
								'We are glad to see you again! Read the latest notices, find answers about products, stores and your account, or talk to us directly',
							)}
						</p>
						<div className={'hero-actions'}>
							<button type="button" className={'cs-btn ghost'} onClick={() => changeTabHandler('notice')}>
								<CampaignOutlinedIcon aria-hidden />
								{t('Notices')}
							</button>
							<button type="button" className={'cs-btn primary'} onClick={() => changeTabHandler('inquiry')}>
								<HeadsetMicOutlinedIcon aria-hidden />
								{t('Ask us')}
							</button>
						</div>
						<a href={CS_PHONE_HREF} className={'hero-hotline'}>
							<span className={'hotline-icon'}>
								<CallOutlinedIcon aria-hidden />
							</span>
							<span className={'hotline-label'}>{t('Customer care')}</span>
							<span className={'hotline-value'}>
								<strong>{CS_PHONE}</strong>
								<small>{t('Call us about a store, a product or your account')}</small>
							</span>
						</a>
					</div>
				</div>
			</section>

			<div className={'container cs-body'}>
				<section className={'cs-center'}>
					<h2>{t('CS center')}</h2>
					<p>{t('I will answer your questions — notices from the Navano team and answers to common questions')}</p>
					<div className={'cs-tabs'} role={'tablist'} aria-label={t('CS center')}>
						<button
							type="button"
							role={'tab'}
							aria-selected={tab === 'notice'}
							className={tab === 'notice' ? 'active' : ''}
							onClick={() => changeTabHandler('notice')}
						>
							{t('Notice')}
							<span>{noticeList.length}</span>
						</button>
						<button
							type="button"
							role={'tab'}
							aria-selected={tab === 'faq'}
							className={tab === 'faq' ? 'active' : ''}
							onClick={() => changeTabHandler('faq')}
						>
							{t('FAQ')}
							<span>{faqList.length}</span>
						</button>
						<button
							type="button"
							role={'tab'}
							aria-selected={tab === 'inquiry'}
							className={tab === 'inquiry' ? 'active' : ''}
							onClick={() => changeTabHandler('inquiry')}
						>
							{t('One-to-one inquiry')}
						</button>
					</div>
					<div className={'cs-quick'}>
						<button type="button" onClick={openChat}>
							<ChatOutlinedIcon aria-hidden />
							{t('Live chat')}
						</button>
						<span aria-hidden>•</span>
						<Link href={'/community?articleCategory=FREE'}>
							<ForumOutlinedIcon aria-hidden />
							{t('Ask the community')}
						</Link>
						<span aria-hidden>•</span>
						<a href={CS_PHONE_HREF}>
							<CallOutlinedIcon aria-hidden />
							{t('Hotline')} ({CS_PHONE})
						</a>
					</div>
				</section>

				{tab === 'notice' && <Notice notices={noticeList} loading={notices.loading} />}
				{tab === 'faq' && <Faq faqs={faqList} loading={faqs.loading} />}
				{tab === 'inquiry' && <Inquiry />}

				<section className={'cs-channels'} id={'cs-channels'}>
					<span className={'channels-eyebrow'}>
						<VerifiedOutlinedIcon aria-hidden />
						{t('Ways to reach us')}
					</span>
					<h3>{t('Contact channels')}</h3>
					<p>{t('Pick the channel that fits your question')}</p>
					<div className={'channel-grid'}>
						<article className={'channel-card'}>
							<div className={'channel-top'}>
								<span className={'channel-icon'}>
									<ChatOutlinedIcon aria-hidden />
								</span>
								<span className={'channel-badge'}>{t('Online')}</span>
							</div>
							<h4>{t('Live chat')}</h4>
							<small>{t('Talk to members and the Navano team')}</small>
							<p>{t('Open the chat in the corner of the page and ask your question. Members and stores online can answer right away.')}</p>
							<button type="button" className={'cs-btn primary block'} onClick={openChat}>
								{t('Open chat')}
								<ArrowOutwardIcon aria-hidden />
							</button>
						</article>
						<article className={'channel-card'}>
							<div className={'channel-top'}>
								<span className={'channel-icon'}>
									<PhoneInTalkOutlinedIcon aria-hidden />
								</span>
								<span className={'channel-badge green'}>{t('Seoul')}</span>
							</div>
							<h4>
								{t('Hotline')}: {CS_PHONE}
							</h4>
							<small>{t('Customer care line')}</small>
							<p>{t('Call us about a product that is not as described, a problem with a store or access to your account.')}</p>
							<a href={CS_PHONE_HREF} className={'cs-btn ghost block'}>
								<CallOutlinedIcon aria-hidden />
								{t('Call now')}
							</a>
						</article>
						<article className={'channel-card'}>
							<div className={'channel-top'}>
								<span className={'channel-icon'}>
									<ForumOutlinedIcon aria-hidden />
								</span>
								<span className={'channel-badge amber'}>
									{FAQ_CATEGORIES.length} {t('topics')}
								</span>
							</div>
							<h4>{t('Ask the community')}</h4>
							<small>{t('Members and stores answer')}</small>
							<p>{t('Questions about a bouquet, a cake or a gift idea? Post on the community boards and get answers from people who make them.')}</p>
							<Link href={'/community?articleCategory=FREE'} className={'cs-btn ghost block'}>
								<ForumOutlinedIcon aria-hidden />
								{t('Go to community')}
							</Link>
						</article>
					</div>
				</section>
			</div>
		</div>
	);
};

export default withLayoutBasic(CS);
