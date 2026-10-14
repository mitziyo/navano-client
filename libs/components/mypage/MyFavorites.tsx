import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination } from '@mui/material';
import { useTranslation } from 'next-i18next';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MyPageHeader from './MyPageHeader';
import ProductCard from '../product/ProductCard';
import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [myFavorites, setMyFavorites] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		loading: getFavoritesLoading,
		data: getFavoritesData,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyFavorites(data.getFavorites?.list);
			setTotal(data.getFavorites?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const likeProductHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			// execute likeTargetProduct Mutation
			await likeTargetProduct({ variables: { input: id } });
			await getFavoritesRefetch({ input: searchFavorites });
			await sweetTopSmallSuccessAlert('succes', 800);
		} catch (err: any) {
			console.log('Error, likeProductHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <div>NAVANO MY FAVORITES MOBILE</div>;
	} else {
		return (
			<div className={'mp-tab'}>
				<MyPageHeader group={'Manage Listings'} title={'My Favorites'} desc={'Products you liked, saved in one place'} />
				<section className={'mp-card'}>
					<div className={'card-head'}>
						<div className={'card-title'}>
							<FavoriteBorderIcon aria-hidden />
							<h3>{t('Liked products')}</h3>
						</div>
						<span className={'card-tag'}>
							{total} {t('products')}
						</span>
					</div>
					{myFavorites?.length ? (
						<div className={'mp-grid'}>
							{myFavorites?.map((product: Product) => (
								<ProductCard product={product} likeProductHandler={likeProductHandler} myFavorites={true} key={product._id} />
							))}
						</div>
					) : (
						<div className={'mp-empty'}>
							<p>{t('You have not liked any products yet')}</p>
						</div>
					)}
					{myFavorites?.length ? (
						<footer className={'mp-pagination'}>
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="rounded"
								onChange={paginationHandler}
							/>
							<span>
								{total} {t('products')}
							</span>
						</footer>
					) : null}
				</section>
			</div>
		);
	}
};

export default MyFavorites;
