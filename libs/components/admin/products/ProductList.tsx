import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { Product } from '../../../types/product/product';
import { ProductUpdate } from '../../../types/product/product.update';
import { REACT_APP_API_URL } from '../../../config';
import { ProductStatus } from '../../../enums/product.enum';
import { EmptyRow, StatusMenu, StatusPill, Tone, shortId, toLabel } from '../AdminUI';

const STATUS_LABEL: Record<string, string> = {
	[ProductStatus.ACTIVE]: 'Active',
	[ProductStatus.HOLD]: 'On hold',
	[ProductStatus.SOLD]: 'Sold out',
	[ProductStatus.DELETE]: 'Deleted',
};
const STATUS_TONE: Record<string, Tone> = {
	[ProductStatus.ACTIVE]: 'success',
	[ProductStatus.HOLD]: 'warning',
	[ProductStatus.SOLD]: 'info',
	[ProductStatus.DELETE]: 'neutral',
};

interface ProductPanelListType {
	products: Product[];
	updateProductHandler: (input: ProductUpdate) => void;
	removeProductHandler: (id: string) => void;
}

export const ProductPanelList = ({ products, updateProductHandler, removeProductHandler }: ProductPanelListType) => (
	<div className={'admin-table-scroll'}>
		<table className={'admin-table'}>
			<thead>
				<tr>
					<th>Product</th>
					<th>Type &amp; occasion</th>
					<th>Store</th>
					<th>City</th>
					<th className={'right'}>Price</th>
					<th className={'center'}>Items</th>
					<th>Listed</th>
					<th className={'center'}>Status</th>
				</tr>
			</thead>
			<tbody>
				{products.length === 0 && <EmptyRow colSpan={8} text={'No products match these filters'} />}
				{products.map((product) => (
					<tr key={product._id}>
						<td>
							{/* Deleted products have no public page */}
							{product.productStatus === ProductStatus.DELETE ? (
								<span className={'cell-identity is-square'}>
									<img src={`${REACT_APP_API_URL}/${product.productImages?.[0]}`} alt="" />
									<span>
										<strong>{product.productTitle}</strong>
										<small>{shortId(product._id)}</small>
									</span>
								</span>
							) : (
								<Link href={`/product/detail?id=${product._id}`} className={'cell-identity is-square'}>
									<img src={`${REACT_APP_API_URL}/${product.productImages?.[0]}`} alt="" />
									<span>
										<strong>{product.productTitle}</strong>
										<small>{shortId(product._id)}</small>
									</span>
								</Link>
							)}
						</td>
						<td>
							<span className={'cell-stack'}>
								<strong>{toLabel(product.productType)}</strong>
								<small>{toLabel(product.productOccasion)}</small>
							</span>
						</td>
						<td>
							<Link href={`/agent/detail?agentId=${product.memberData?._id}`} className={'cell-link'}>
								{product.memberData?.memberNick}
							</Link>
						</td>
						<td>{toLabel(product.productLocation)}</td>
						<td className={'right mono'}>${product.productPrice}</td>
						<td className={'center mono'}>{product.productItemCount}</td>
						<td className={'mono'}>
							<Moment format={'YYYY.MM.DD'}>{product.createdAt}</Moment>
						</td>
						<td className={'center'}>
							{/* The API changes only ACTIVE products and removes only DELETE ones */}
							{product.productStatus === ProductStatus.ACTIVE ? (
								<StatusMenu
									label={STATUS_LABEL[product.productStatus]}
									tone={STATUS_TONE[product.productStatus]}
									options={Object.values(ProductStatus)
										.filter((status) => status !== ProductStatus.ACTIVE)
										.map((status) => ({ value: status, label: STATUS_LABEL[status] }))}
									onSelect={(status) => updateProductHandler({ _id: product._id, productStatus: status as ProductStatus })}
								/>
							) : (
								<span className={'cell-actions'}>
									<StatusPill label={STATUS_LABEL[product.productStatus]} tone={STATUS_TONE[product.productStatus]} />
									{product.productStatus === ProductStatus.DELETE && (
										<button
											type="button"
											className={'icon-btn danger'}
											aria-label={'Remove for good'}
											title={'Remove for good'}
											onClick={() => removeProductHandler(product._id)}
										>
											<DeleteForeverOutlinedIcon />
										</button>
									)}
								</span>
							)}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);
