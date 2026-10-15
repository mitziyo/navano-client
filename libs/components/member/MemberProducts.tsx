import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import ProductCard from '../product/ProductCard';
import { useTranslation } from 'next-i18next';
import { Product } from '../../types/product/product';
import { ProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

const MyProducts: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>({ ...initialInput });
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setAgentProducts(data?.getProducts?.list);
			setTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
		useEffect(() => {
		getProductsRefetch().then()
	}, [searchFilter]);

	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<div className={'member-tab'}>
			<header className={'panel-head'}>
				<div>
					<h2>{t('Products')}</h2>
					<p>{t('Bouquets, cakes and chocolates from this store')}</p>
				</div>
				<span className={'panel-count'}>
					{total} {t('products')}
				</span>
			</header>
			{agentProducts?.length === 0 ? (
				<div className={'panel-empty'}>
					<p>{t('No products yet')}</p>
				</div>
			) : (
				<div className={'tab-grid three'}>
					{agentProducts?.map((product: Product) => (
						<ProductCard product={product} recentlyVisited key={product?._id} />
					))}
				</div>
			)}
			{agentProducts.length !== 0 && (
				<footer className={'panel-pagination'}>
					<Pagination
						count={Math.ceil(total / searchFilter.limit)}
						page={searchFilter.page}
						shape="rounded"
						onChange={paginationHandler}
					/>
					<span>
						{total} {t('products')}
					</span>
				</footer>
			)}
		</div>
	);
};

MyProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MyProducts;
