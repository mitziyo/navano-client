import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import AddIcon from '@mui/icons-material/Add';
import MyPageHeader from './MyPageHeader';
import { ProductCard } from './ProductCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Product } from '../../types/product/product';
import { AgentProductsInquiry } from '../../types/product/product.input';
import { T } from '../../types/common';
import { ProductStatus } from '../../enums/product.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_AGENT_PRODUCTS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyProducts: NextPage = ({ initialInput, ...props }: any) => {
	const [searchFilter, setSearchFilter] = useState<AgentProductsInquiry>(initialInput);
	const [agentProducts, setAgentProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/

	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const {
		loading: getAgentProductsLoading,
		data: getAgentProductsData,
		error: getAgentProductsError,
		refetch: getAgentProductsRefetch,
	} = useQuery(GET_AGENT_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProducts(data?.getAgentProducts?.list);
			setTotal(data?.getAgentProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ProductStatus) => {
		setSearchFilter({ ...searchFilter, search: { productStatus: value } });
	};

	const deleteProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this product?')) {
				await updateProduct({
					variables: {
						input: {
							_id: id,
							productStatus: 'DELETE',
						},
					},
				});

				await getAgentProductsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateProductHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Are you sure change to ${status} status?`)) {
				await updateProduct({
					variables: {
						input: {
							_id: id,
							productStatus: status,
						},
					},
				});

				await getAgentProductsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	return (
		<div id="my-product-page" className={'mp-tab'}>
			<MyPageHeader
				group={'Manage Listings'}
				title={'My Products'}
				desc={'Manage your bouquets, cakes and chocolates and mark them sold'}
				actions={
					<Link
						href={{ pathname: '/mypage', query: { category: 'addProduct' } }}
						scroll={false}
						className={'mp-btn mp-btn-primary'}
					>
						<AddIcon />
						<span>{t('Add Product')}</span>
					</Link>
				}
			/>
			<section className={'mp-card'}>
				<div className={'card-head'}>
					<div className={'segmented'} role={'tablist'} aria-label={t('Status')}>
						<button
							type="button"
							role={'tab'}
							aria-selected={searchFilter.search.productStatus === 'ACTIVE'}
							className={searchFilter.search.productStatus === 'ACTIVE' ? 'active' : ''}
							onClick={() => changeStatusHandler(ProductStatus.ACTIVE)}
						>
							{t('On sale')}
						</button>
						<button
							type="button"
							role={'tab'}
							aria-selected={searchFilter.search.productStatus === 'SOLD'}
							className={searchFilter.search.productStatus === 'SOLD' ? 'active' : ''}
							onClick={() => changeStatusHandler(ProductStatus.SOLD)}
						>
							{t('Sold out')}
						</button>
					</div>
					<span className={'card-tag'}>
						{total} {t('products')}
					</span>
				</div>
				<div className={`mp-table ${searchFilter.search.productStatus === 'ACTIVE' ? 'with-actions' : ''}`}>
					<div className={'mp-table-head'}>
						<span>{t('Product')}</span>
						<span>{t('Published')}</span>
						<span>{t('Status')}</span>
						<span>{t('Views')}</span>
						{searchFilter.search.productStatus === 'ACTIVE' && <span>{t('Actions')}</span>}
					</div>
					{agentProducts?.length === 0 ? (
						<div className={'mp-empty'}>
							<p>{t('No products here yet')}</p>
						</div>
					) : (
						agentProducts.map((product: Product) => {
							return (
								<ProductCard
									key={product?._id}
									product={product}
									deleteProductHandler={deleteProductHandler}
									updateProductHandler={updateProductHandler}
								/>
							);
						})
					)}
				</div>
				{agentProducts.length !== 0 && (
					<footer className={'mp-pagination'}>
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
			</section>
		</div>
	);
};

MyProducts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			productStatus: 'ACTIVE',
		},
	},
};

export default MyProducts;
