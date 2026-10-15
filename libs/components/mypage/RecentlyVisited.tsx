import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import { useTranslation } from 'next-i18next';
import HistoryIcon from '@mui/icons-material/History';
import MyPageHeader from './MyPageHeader';
import ProductCard from '../product/ProductCard';
import { Product } from '../../types/product/product';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';

const RecentlyVisited: NextPage = () => {
	const { t } = useTranslation('common');
	const [recentlyVisited, setRecentlyVisited] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/

	const {
		loading: getViseitedLoading,
		data: getVisitedData,
		error: getVisitedError,
		refetch: getVisitedRefetch,
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		onCompleted: (data: T) => {
			setRecentlyVisited(data.getVisited?.list);
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	return (
		<div className={'mp-tab'}>
			<MyPageHeader group={'Manage Listings'} title={'Recently Visited'} desc={'Products you opened lately'} />
			<section className={'mp-card'}>
				<div className={'card-head'}>
					<div className={'card-title'}>
						<HistoryIcon aria-hidden />
						<h3>{t('Viewed products')}</h3>
					</div>
					<span className={'card-tag'}>
						{total} {t('products')}
					</span>
				</div>
				{recentlyVisited?.length ? (
					<div className={'mp-grid'}>
						{recentlyVisited?.map((product: Product) => (
							<ProductCard product={product} recentlyVisited={true} key={product._id} />
						))}
					</div>
				) : (
					<div className={'mp-empty'}>
						<p>{t('You have not opened any products yet')}</p>
					</div>
				)}
				{recentlyVisited?.length ? (
					<footer className={'mp-pagination'}>
						<Pagination
							count={Math.ceil(total / searchVisited.limit)}
							page={searchVisited.page}
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
};

export default RecentlyVisited;
