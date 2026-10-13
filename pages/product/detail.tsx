import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Pagination } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ProductCard from '../../libs/components/product/ProductCard';
import ProductTypeIcon from '../../libs/components/common/ProductTypeIcon';
import Review from '../../libs/components/product/Review';
import { itemCountLabel, statusLabel, toLabel } from '../../libs/components/homepage/productLabels';
import { memberRef } from '../../libs/components/mypage/MyMenu';
import { Product } from '../../libs/types/product/product';
import { Comment } from '../../libs/types/comment/comment';
import { CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { ProductStatus } from '../../libs/enums/product.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { GET_COMMENTS, GET_PRODUCT, GET_PRODUCTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../../libs/config';
import { formatterStr } from '../../libs/utils';
import { sweetErrorHandling, sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const COMMENT_LIMIT = 5;

const imageUrl = (path?: string) => (path ? `${REACT_APP_API_URL}/${path}` : '/img/banner/product-hero.jpg');

const ProductDetail: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const productId = typeof router.query.id === 'string' ? router.query.id : '';
	const [activeImage, setActiveImage] = useState<string>('');
	const [commentPage, setCommentPage] = useState<number>(1);
	const [reviewText, setReviewText] = useState<string>('');
	const [contact, setContact] = useState({ name: '', phone: '', message: '' });
	const [mounted, setMounted] = useState<boolean>(false);
	useEffect(() => setMounted(true), []);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [createComment] = useMutation(CREATE_COMMENT);

	const { loading, data, error } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'cache-and-network',
		variables: { input: productId },
		skip: !productId,
	});
	const product: Product | undefined = data?.getProduct;

	// Same category first, the product itself is left out
	const { data: similarData } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'productLikes',
				direction: Direction.DESC,
				search: { typeList: product ? [product.productType] : [] },
			},
		},
		skip: !product,
	});
	const similarProducts: Product[] = (similarData?.getProducts?.list ?? [])
		.filter((item: Product) => item._id !== product?._id)
		.slice(0, 3);

	const commentInquiry: CommentsInquiry = {
		page: commentPage,
		limit: COMMENT_LIMIT,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: { commentRefId: productId },
	};
	const { data: commentsData, refetch: refetchComments } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !productId,
	});
	const comments: Comment[] = commentsData?.getComments?.list ?? [];
	const commentTotal: number = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		setActiveImage(product?.productImages?.[0] ?? '');
		setCommentPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product?._id]);

	useEffect(() => {
		if (!product) return;
		setContact((prev) => ({
			...prev,
			message: `${t('Hello, I am interested in')} “${product.productTitle}”.`,
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product?._id]);

	const images = useMemo(() => product?.productImages ?? [], [product?.productImages]);

	/** HANDLERS **/
	// The mutation returns productLikes + meLiked, so Apollo updates this page and the cards from the cache
	const likeProductHandler = async (current: any, id: string) => {
		try {
			if (!id) return;
			if (!current?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { input: id } });
		} catch (err: any) {
			console.log('ERROR, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const createCommentHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			const content = reviewText.trim();
			if (!content) return;
			await createComment({
				variables: { input: { commentGroup: CommentGroup.PRODUCT, commentContent: content, commentRefId: productId } },
			});
			setReviewText('');
			setCommentPage(1);
			await refetchComments({ input: { ...commentInquiry, page: 1 } });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	// There is no messaging API yet, so the message goes to the store's phone through the SMS app
	const sendMessageHandler = (e: React.FormEvent) => {
		e.preventDefault();
		const phone = product?.memberData?.memberPhone;
		if (!phone) return;
		const lines = [contact.message.trim(), contact.name && `— ${contact.name}`, contact.phone && `${t('Phone')}: ${contact.phone}`];
		window.location.href = `sms:${phone}?&body=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`;
	};

	if (device === 'mobile') {
		return <div>PRODUCT DETAIL PAGE</div>;
	}

	// Without an id there is nothing to load; the check waits for hydration so server and client HTML match
	const missingId = mounted && router.isReady && !productId;

	if (!missingId && (!productId || (loading && !product))) {
		return (
			<div id={'product-detail-page'}>
				<div className={'container pd-loading'} aria-busy="true">
					<div className={'skeleton-block media'} />
					<div className={'skeleton-block side'} />
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div id={'product-detail-page'}>
				<div className={'container pd-missing'}>
					<h1>{t('This product is not available')}</h1>
					<p>{error ? t('It may be on hold, sold out or removed by the store.') : ''}</p>
					<Link href={'/product'} className={'pd-btn primary'}>
						{t('Browse all products')}
					</Link>
				</div>
			</div>
		);
	}

	const store = product.memberData;
	const liked = Boolean(product.meLiked?.[0]?.myFavorite);
	const status = statusLabel(product.productStatus);
	const isActive = product.productStatus === ProductStatus.ACTIVE;
	const storeHref = `/agent/detail?agentId=${store?._id}`;
	const tiles = [
		{ icon: <Inventory2OutlinedIcon aria-hidden />, label: t('Items'), value: product.productItemCount, big: true },
		{ icon: <PlaceOutlinedIcon aria-hidden />, label: t('Location'), value: t(toLabel(product.productLocation)) },
		{ icon: <CalendarTodayOutlinedIcon aria-hidden />, label: t('Listed'), value: moment(product.createdAt).format('YYYY') },
		{ icon: <VerifiedOutlinedIcon aria-hidden />, label: t('Status'), value: t(status || 'Active'), accent: isActive },
		{ icon: <ProductTypeIcon type={product.productType} />, label: t('Type'), value: t(toLabel(product.productType)) },
	];
	const details: [string, React.ReactNode][][] = [
		[
			[t('Price'), `$${formatterStr(product.productPrice)}`],
			[t('Items available'), product.productItemCount],
			[t('Location'), t(toLabel(product.productLocation))],
			[t('Address'), product.productAddress],
		],
		[
			[t('Listed'), moment(product.createdAt).format('DD.MM.YYYY')],
			[t('Product type'), t(toLabel(product.productType))],
			[t('Occasion'), t(toLabel(product.productOccasion))],
			[t('Status'), <span className={`status-dot ${isActive ? 'on' : ''}`}>{t(status || 'Active')}</span>],
		],
	];

	return (
		<div id={'product-detail-page'}>
			<div className={'container'}>
				<div className={'pd-crumbs'}>
					<nav aria-label={'breadcrumb'}>
						<Link href={'/product'}>{t('Products')}</Link>
						<span aria-hidden>/</span>
						<Link href={{ pathname: '/product', query: { input: JSON.stringify({ page: 1, limit: 9, search: { typeList: [product.productType] } }) } }}>
							{t(toLabel(product.productType))}
						</Link>
						<span aria-hidden>/</span>
						<span className={'current'}>{memberRef(product._id)}</span>
					</nav>
					<span className={`stock-pill ${isActive ? '' : 'off'}`}>
						<span aria-hidden />
						{isActive ? t('In stock') : t(status)}
					</span>
				</div>

				<div className={'pd-layout'}>
					<section className={'pd-main'}>
						<header className={'pd-card pd-head'}>
							<div>
								<h1>{product.productTitle}</h1>
								<p className={'pd-meta'}>
									<span>
										<PlaceOutlinedIcon aria-hidden />
										{t(toLabel(product.productLocation))}
									</span>
									<span aria-hidden>•</span>
									<span className={'accent'}>{t(toLabel(product.productType))}</span>
									<span aria-hidden>•</span>
									<span>{t(toLabel(product.productOccasion))}</span>
									<span aria-hidden>•</span>
									<span>
										<ScheduleIcon aria-hidden />
										{moment(product.createdAt).fromNow()}
									</span>
								</p>
							</div>
							<div className={'pd-price'}>
								<div className={'pd-stats'}>
									<span aria-label={`${product.productViews} ${t('views')}`}>
										<VisibilityOutlinedIcon aria-hidden />
										{product.productViews}
									</span>
									<button
										type="button"
										className={`pd-like ${liked ? 'on' : ''}`}
										aria-pressed={liked}
										aria-label={liked ? t('Unlike') : t('Like')}
										onClick={() => likeProductHandler(user, product._id)}
									>
										{liked ? <FavoriteIcon aria-hidden /> : <FavoriteBorderIcon aria-hidden />}
										{product.productLikes}
									</button>
								</div>
								<strong>
									${formatterStr(product.productPrice)}
									<small>USD</small>
								</strong>
							</div>
						</header>

						<div className={'pd-card pd-gallery'}>
							<div className={'pd-stage'}>
								<img src={imageUrl(activeImage)} alt={product.productTitle} />
								<span className={'stage-badge'}>
									<span aria-hidden />
									{t('Handmade by')} {store?.memberFullName || store?.memberNick}
								</span>
								<span className={'stage-note'}>{itemCountLabel(product.productType, product.productItemCount)}</span>
							</div>
							<div className={'pd-thumbs'}>
								{images.map((image, index) => (
									<button
										type="button"
										key={image}
										className={image === activeImage ? 'active' : ''}
										aria-label={`${t('Photo')} ${index + 1}`}
										aria-pressed={image === activeImage}
										onClick={() => setActiveImage(image)}
									>
										<img src={imageUrl(image)} alt="" />
									</button>
								))}
								<span className={'thumbs-count'}>
									<PhotoCameraOutlinedIcon aria-hidden />
									{images.length} {images.length === 1 ? t('photo') : t('photos')}
								</span>
							</div>
						</div>

						<dl className={'pd-tiles'}>
							{tiles.map((tile) => (
								<div key={tile.label}>
									<span className={'tile-icon'}>{tile.icon}</span>
									<span>
										<dt>{tile.label}</dt>
										<dd className={`${tile.big ? 'big' : ''} ${tile.accent ? 'accent' : ''}`}>{tile.value}</dd>
									</span>
								</div>
							))}
						</dl>

						<div className={'pd-card pd-about'}>
							<section className={'pd-desc'}>
								<h2>
									<DescriptionOutlinedIcon aria-hidden />
									{t('Product Description')}
								</h2>
								<p>{product.productDesc || t('The store has not added a description yet.')}</p>
								<div className={'pd-tags'}>
									<span>{t(toLabel(product.productType))}</span>
									<span>{t(toLabel(product.productOccasion))}</span>
									<span>{t(toLabel(product.productLocation))}</span>
									<span>{itemCountLabel(product.productType, product.productItemCount)}</span>
								</div>
							</section>
							<section className={'pd-details'}>
								<h3>{t('Product Details')}</h3>
								<div className={'details-grid'}>
									{details.map((column, index) => (
										<dl key={index}>
											{column.map(([label, value]) => (
												<div key={label}>
													<dt>{label}</dt>
													<dd>{value}</dd>
												</div>
											))}
										</dl>
									))}
								</div>
							</section>
						</div>

						<div className={'pd-card pd-reviews'} id={'reviews'}>
							<div className={'reviews-head'}>
								<h2>{t('Reviews')}</h2>
								<span>
									<ChatBubbleOutlineIcon aria-hidden />
									{commentTotal} {t('reviews')}
								</span>
							</div>
							{comments.length > 0 && (
								<div className={'review-list'}>
									{comments.map((comment) => (
										<Review comment={comment} key={comment._id} />
									))}
									{commentTotal > COMMENT_LIMIT && (
										<Pagination
											page={commentPage}
											count={Math.ceil(commentTotal / COMMENT_LIMIT)}
											onChange={(_, value) => setCommentPage(value)}
											shape="rounded"
										/>
									)}
								</div>
							)}
							<form className={'review-form'} onSubmit={createCommentHandler}>
								<label htmlFor={'review-text'}>{t('Leave A Review')}</label>
								<textarea
									id={'review-text'}
									rows={4}
									maxLength={100}
									value={reviewText}
									placeholder={
										user?._id
											? t('Share how it looked, tasted and arrived')
											: t('Log in to leave a review')
									}
									disabled={!user?._id}
									onChange={(e) => setReviewText(e.target.value)}
								/>
								<div className={'form-foot'}>
									<span>{reviewText.length}/100</span>
									<button type="submit" className={'pd-btn ghost'} disabled={!user?._id || !reviewText.trim()}>
										{t('Submit Review')}
										<NorthEastIcon aria-hidden />
									</button>
								</div>
							</form>
						</div>
					</section>

					<aside className={'pd-side'}>
						<div className={'pd-card pd-contact'}>
							<header>
								<h2>{t('Get More Information')}</h2>
								<p>{t('Ask the store about this product before you order')}</p>
							</header>
							<div className={'store-row'}>
								<img src={store?.memberImage ? imageUrl(store.memberImage) : '/img/profile/defaultUser.svg'} alt="" />
								<div>
									<Link href={storeHref} className={'store-name'}>
										{store?.memberFullName || store?.memberNick}
									</Link>
									{store?.memberPhone && (
										<a href={`tel:${store.memberPhone}`} className={'store-phone'}>
											<CallOutlinedIcon aria-hidden />
											{store.memberPhone}
										</a>
									)}
									<Link href={storeHref} className={'store-link'}>
										{t('View Listings')}
									</Link>
								</div>
							</div>
							<form onSubmit={sendMessageHandler}>
								<label>
									<span>{t('Name')}</span>
									<input
										type="text"
										value={contact.name}
										placeholder={t('Enter your name')}
										onChange={(e) => setContact({ ...contact, name: e.target.value })}
									/>
								</label>
								<label>
									<span>{t('Phone')}</span>
									<input
										type="tel"
										value={contact.phone}
										placeholder={t('Enter your phone')}
										onChange={(e) => setContact({ ...contact, phone: e.target.value })}
									/>
								</label>
								<label>
									<span>{t('Message')}</span>
									<textarea
										rows={4}
										value={contact.message}
										onChange={(e) => setContact({ ...contact, message: e.target.value })}
									/>
								</label>
								<button type="submit" className={'pd-btn coral'} disabled={!store?.memberPhone || !contact.message.trim()}>
									{t('Send Message')}
									<NorthEastIcon aria-hidden />
								</button>
								<p className={'form-note'}>{t('Opens your messaging app with this message to the store')}</p>
							</form>
						</div>

						<div className={'pd-card pd-store'}>
							<div className={'store-top'}>
								<span>{store?.memberFullName || store?.memberNick}</span>
								<span className={'accent'}>{t('Store')}</span>
							</div>
							<p>
								<StorefrontOutlinedIcon aria-hidden />
								{store?.memberAddress || t(toLabel(product.productLocation))}
							</p>
							<div className={'store-foot'}>
								<span>
									{store?.memberLikes ?? 0} {t('likes')}
								</span>
								<Link href={storeHref}>{t('Visit store')} →</Link>
							</div>
						</div>
					</aside>
				</div>

				{similarProducts.length > 0 && (
					<section className={'pd-similar'}>
						<h2>{t('Similar products')}</h2>
						<p>
							{t('More')} {t(toLabel(product.productType)).toLowerCase()} {t('from stores on Navano')}
						</p>
						<div className={'similar-grid'}>
							{similarProducts.map((item) => (
								<ProductCard product={item} likeProductHandler={likeProductHandler} key={item._id} />
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
};

export default withLayoutFull(ProductDetail);
