import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberProducts from '../../libs/components/member/MemberProducts';
import { useRouter } from 'next/router';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberArticles from '../../libs/components/member/MemberArticles';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { GET_MEMBER } from '../../apollo/user/query';
import { MemberType } from '../../libs/enums/member.enum';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category;
	const memberId = typeof router.query?.memberId === 'string' ? router.query.memberId : '';
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	// The server render never knows the query, so the not-found check waits until after hydration
	const [mounted, setMounted] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	// Same query as MemberMenu (shared through the cache): the default tab depends on the member type
	const { data: memberData, error: memberError } = useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-first',
		variables: { input: memberId },
		skip: !memberId,
	});
	const memberType: string | undefined = memberData?.getMember?.memberType;

	/** LIFECYCLES **/
	useEffect(() => setMounted(true), []);

	// Stores open on Products; other members have no products, so they open on Articles
	useEffect(() => {
		if (!router.isReady || !memberType) return;
		const fallback = memberType === MemberType.AGENT ? 'products' : 'articles';
		if (!category || (category === 'products' && memberType !== MemberType.AGENT)) {
			router.replace(
				{
					pathname: router.pathname,
					query: { ...router.query, category: fallback },
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [category, memberType, router]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			console.log('id:', id);
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Subscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Subscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Success!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetErrorHandling(err.message).then();
		}
	};
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const memberMissing = mounted && router.isReady && (!memberId || Boolean(memberError));

	if (device === 'mobile') {
		return <>MEMBER PAGE MOBILE</>;
	} else if (memberMissing) {
		return (
			<div id="member-page" style={{ position: 'relative' }}>
				<div className="container member-missing">
					<h1>{t('Member not found')}</h1>
					<p>{t('This profile link is missing or no longer works.')}</p>
					<Link href={'/community?articleCategory=FREE'}>{t('Go to community')}</Link>
				</div>
			</div>
		);
	} else {
		return (
			<div id="member-page" style={{ position: 'relative' }}>
				<div className="container">
					<Stack className={'member-page'}>
						<Stack className={'back-frame'}>
							<Stack className={'left-config'}>
								<MemberMenu subscribeHandler={subscribeHandler} unsubscribeHandler={unsubscribeHandler} />
							</Stack>
							<Stack className="main-config" mb={'76px'}>
								<Stack className={'list-config'}>
									{category === 'products' && <MemberProducts />}
									{category === 'followers' && (
										<MemberFollowers
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'followings' && (
										<MemberFollowings
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'articles' && <MemberArticles />}
								</Stack>
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MemberPage);
