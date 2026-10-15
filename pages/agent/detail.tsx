import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductCard from '../../libs/components/product/ProductCard';
import ProfileHero, { ProfileMetric } from '../../libs/components/member/ProfileHero';
import { memberRef } from '../../libs/components/mypage/MyMenu';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Product } from '../../libs/types/product/product';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_PRODUCTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { MemberType } from '../../libs/enums/member.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	// The server render never knows the query, so the missing-store check waits until after hydration
	const [mounted, setMounted] = useState<boolean>(false);
	useEffect(() => setMounted(true), []);
	const user = useReactiveVar(userVar);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [productTotal, setProductTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/

	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
		onCompleted: (data: T) => {
			setAgent(data?.getMember);
			setSearchFilter({
				...searchFilter,
				search: {
					memberId: data?.getMember?._id,
				},
			});
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: data?.getMember?._id,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: data?.getMember?._id,
			});
		},
	});

	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProducts(data?.getProducts?.list);
			setProductTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) setAgentId(router.query.agentId as string);
	}, [router]);

	useEffect(() => {}, [searchFilter]);
	useEffect(() => {}, [commentInquiry]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const productPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agentId) throw new Error('Cannot write a review for yourself');

			await createComment({
				variables: {
					input: insertCommentData,
				},
			});
			setInsertCommentData({ ...insertCommentData, commentContent: '' });
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeProductHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProduct({
				variables: {
					input: id,
				},
			});
			await getProductsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// No agentId, an unknown id or a member that is not a store: say so instead of an empty profile
	const storeMissing =
		mounted &&
		router.isReady &&
		(!router.query.agentId ||
			Boolean(getMemberError) ||
			(getMemberData?.getMember && getMemberData.getMember.memberType !== MemberType.AGENT));

	if (storeMissing) {
		return (
			<Stack className={'agent-detail-page nv-profile'}>
				<Stack className={'container store-missing'}>
					<h1>{t('Store not found')}</h1>
					<p>{t('This store link is missing or no longer works.')}</p>
					<Link href={'/agent'}>{t('Browse all stores')}</Link>
				</Stack>
			</Stack>
		);
	} else {
		const metrics: ProfileMetric[] = [
			{ label: t('Products'), value: productTotal },
			{ label: t('Reviews'), value: commentTotal },
			{ label: t('Likes'), value: agent?.memberLikes ?? 0 },
			{ label: t('Views'), value: agent?.memberViews ?? 0 },
			{ label: t('Followers'), value: agent?.memberFollowers ?? 0 },
		];

		return (
			<div className={'agent-detail-page nv-profile'}>
				<div className={'container nv-shell'}>
					<aside className={'nv-side'}>
						<nav className={'side-menu'} aria-label={t('Store')}>
							<div className={'side-profile'}>
								<img
									src={agent?.memberImage ? `${REACT_APP_API_URL}/${agent?.memberImage}` : '/img/profile/defaultUser.svg'}
									alt=""
								/>
								<div>
									<strong>{agent?.memberFullName ?? agent?.memberNick}</strong>
									<small>{t('Store')}</small>
								</div>
							</div>
							{agent?.memberPhone && (
								<a href={`tel:${agent.memberPhone}`} className={'side-contact'}>
									<CallOutlinedIcon aria-hidden />
									{agent.memberPhone}
								</a>
							)}
							<div className={'side-group'}>
								<span className={'side-group-title'}>{t('Store')}</span>
								<a href={'#store-products'} className={'side-link'}>
									<StorefrontOutlinedIcon aria-hidden />
									<span>{t('Products')}</span>
									<span className={'side-count'}>{productTotal}</span>
								</a>
								<a href={'#store-reviews'} className={'side-link'}>
									<RateReviewOutlinedIcon aria-hidden />
									<span>{t('Reviews')}</span>
									<span className={'side-count'}>{commentTotal}</span>
								</a>
							</div>
							<div className={'side-group'}>
								<span className={'side-group-title'}>{t('Community')}</span>
								<button
									type="button"
									className={'side-link'}
									onClick={() => redirectToMemberPageHandler(agent?._id as string)}
								>
									<PersonOutlineIcon aria-hidden />
									<span>{t('View public page')}</span>
								</button>
							</div>
							<div className={'side-footer'}>
								<span>ID: {memberRef(agent?._id)}</span>
							</div>
						</nav>
					</aside>

					<section className={'nv-main'}>
						<ProfileHero member={agent} metrics={metrics} />

						<div className={'nv-panel'} id={'store-products'}>
							<header className={'panel-head'}>
								<div>
									<h2>{t('Products')}</h2>
									<p>{t('Bouquets, cakes and chocolates from this store')}</p>
								</div>
								<span className={'panel-count'}>
									{productTotal} {t('products')}
								</span>
							</header>
							{productTotal ? (
								<>
									<div className={'tab-grid three'}>
										{agentProducts.map((product: Product) => (
											<ProductCard product={product} likeProductHandler={likeProductHandler} key={product?._id} />
										))}
									</div>
									<footer className={'panel-pagination'}>
										<Pagination
											page={searchFilter.page}
											count={Math.ceil(productTotal / searchFilter.limit) || 1}
											onChange={productPaginationChangeHandler}
											shape="rounded"
										/>
										<span>
											{productTotal} {t('products')}
										</span>
									</footer>
								</>
							) : (
								<div className={'panel-empty'}>
									<p>{t('No products yet')}</p>
								</div>
							)}
						</div>

						<div className={'nv-panel'} id={'store-reviews'}>
							<header className={'panel-head'}>
								<div>
									<h2>{t('Reviews')}</h2>
									<p>{t('What customers say about this store')}</p>
								</div>
								<span className={'panel-count'}>
									<StarIcon aria-hidden />
									{commentTotal} {t('reviews')}
								</span>
							</header>
							{commentTotal !== 0 && (
								<div className={'review-stack'}>
									{agentComments?.map((comment: Comment) => {
										return <ReviewCard comment={comment} key={comment?._id} />;
									})}
									<footer className={'panel-pagination'}>
										<Pagination
											page={commentInquiry.page}
											count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
											onChange={commentPaginationChangeHandler}
											shape="rounded"
										/>
									</footer>
								</div>
							)}
							<div className={'review-form'}>
								<label htmlFor={'store-review'}>{t('Leave A Review')}</label>
								<textarea
									id={'store-review'}
									rows={4}
									placeholder={user?._id ? t('Share your experience with this store') : t('Log in to leave a review')}
									onChange={({ target: { value } }: any) => {
										setInsertCommentData({ ...insertCommentData, commentContent: value });
									}}
									value={insertCommentData.commentContent}
								></textarea>
								<div className={'form-foot'}>
									<Button
										className={'submit-review'}
										disabled={insertCommentData.commentContent === '' || user?._id === ''}
										onClick={createCommentHandler}
									>
										{t('Submit Review')}
										<NorthEastIcon aria-hidden />
									</Button>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		);
	}
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
