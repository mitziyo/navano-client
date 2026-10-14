import React, { useState } from 'react';
import type { NextPage } from 'next';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { ProductPanelList } from '../../../libs/components/admin/products/ProductList';
import { AdminPageHeader, AdminPager, AdminSelect, AdminStats, AdminTabs, toLabel, useAdminTotal } from '../../../libs/components/admin/AdminUI';
import { AllProductsInquiry } from '../../../libs/types/product/product.input';
import { Product } from '../../../libs/types/product/product';
import { ProductUpdate } from '../../../libs/types/product/product.update';
import { ProductLocation, ProductStatus } from '../../../libs/enums/product.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';

const ROOT = 'getAllProductsByAdmin';
const LOCATION_OPTIONS = [
	{ value: 'ALL', label: 'All cities' },
	...Object.values(ProductLocation).map((location) => ({ value: location, label: toLabel(location) })),
];

const AdminProducts: NextPage = () => {
	const client = useApolloClient();
	const [inquiry, setInquiry] = useState<AllProductsInquiry>({ page: 1, limit: 10, sort: 'createdAt', direction: Direction.DESC, search: {} });

	/** APOLLO REQUESTS **/
	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);
	const { data } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
	});
	const products: Product[] = data?.[ROOT]?.list ?? [];
	const total: number = data?.[ROOT]?.metaCounter?.[0]?.total ?? 0;

	const totals = {
		all: useAdminTotal(GET_ALL_PRODUCTS_BY_ADMIN, ROOT, {}),
		active: useAdminTotal(GET_ALL_PRODUCTS_BY_ADMIN, ROOT, { productStatus: ProductStatus.ACTIVE }),
		hold: useAdminTotal(GET_ALL_PRODUCTS_BY_ADMIN, ROOT, { productStatus: ProductStatus.HOLD }),
		sold: useAdminTotal(GET_ALL_PRODUCTS_BY_ADMIN, ROOT, { productStatus: ProductStatus.SOLD }),
		delete: useAdminTotal(GET_ALL_PRODUCTS_BY_ADMIN, ROOT, { productStatus: ProductStatus.DELETE }),
	};

	/** HANDLERS **/
	const setSearch = (patch: Partial<AllProductsInquiry['search']>) => {
		const search = { ...inquiry.search, ...patch };
		(Object.keys(search) as (keyof typeof search)[]).forEach((key) => !search[key] && delete search[key]);
		setInquiry({ ...inquiry, page: 1, search });
	};

	const refresh = () => client.refetchQueries({ include: [GET_ALL_PRODUCTS_BY_ADMIN] });

	const updateProductHandler = async (input: ProductUpdate) => {
		try {
			await updateProductByAdmin({ variables: { input } });
			await refresh();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// The API removes only products that are already in DELETE status
	const removeProductHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove this product for good?'))) return;
			await removeProductByAdmin({ variables: { input: id } });
			await refresh();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const location = inquiry.search.productLocationList?.[0] ?? 'ALL';

	return (
		<>
			<AdminPageHeader
				title={'Product List'}
				tag={`${totals.all} products`}
				desc={'Flowers, chocolates and cakes listed by the stores. Active products can be put on hold, sold out or deleted from their status pill; deleted products can be removed for good.'}
			/>

			<AdminStats
				items={[
					{ label: 'Total products', value: totals.all, note: 'Listed by every store', icon: <Inventory2OutlinedIcon /> },
					{ label: 'Active', value: totals.active, note: 'Shown in search and on store pages', icon: <TaskAltOutlinedIcon />, tone: 'success' },
					{ label: 'On hold', value: totals.hold, note: 'Hidden until the store or an admin activates it', icon: <PauseCircleOutlineIcon />, tone: 'warning' },
					{ label: 'Sold out', value: totals.sold, note: 'Kept on the store page as sold', icon: <SellOutlinedIcon />, tone: 'info' },
				]}
			/>

			<AdminTabs
				value={inquiry.search.productStatus ?? 'ALL'}
				onChange={(value) => setSearch({ productStatus: value === 'ALL' ? undefined : (value as ProductStatus) })}
				tabs={[
					{ value: 'ALL', label: 'All', count: totals.all },
					{ value: ProductStatus.ACTIVE, label: 'Active', count: totals.active },
					{ value: ProductStatus.HOLD, label: 'On hold', count: totals.hold },
					{ value: ProductStatus.SOLD, label: 'Sold out', count: totals.sold },
					{ value: ProductStatus.DELETE, label: 'Deleted', count: totals.delete },
				]}
			/>

			<div className={'admin-filters'}>
				<AdminSelect
					label={'City'}
					value={location}
					options={LOCATION_OPTIONS}
					onChange={(value) => setSearch({ productLocationList: value === 'ALL' ? undefined : [value as ProductLocation] })}
				/>
			</div>

			<div className={'admin-table-card'}>
				<ProductPanelList products={products} updateProductHandler={updateProductHandler} removeProductHandler={removeProductHandler} />
				<AdminPager
					total={total}
					page={inquiry.page}
					limit={inquiry.limit}
					onPage={(page) => setInquiry({ ...inquiry, page })}
					onLimit={(limit) => setInquiry({ ...inquiry, page: 1, limit })}
				/>
			</div>
		</>
	);
};

export default withAdminLayout(AdminProducts);
