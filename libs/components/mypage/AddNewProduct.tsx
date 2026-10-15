import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import MyPageHeader from './MyPageHeader';
import { toLabel } from '../homepage/productLabels';
import { ProductLocation, ProductOccasion, ProductType } from '../../enums/product.enum';
import { REACT_APP_API_URL } from '../../config';
import { ProductInput } from '../../types/product/product.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_PRODUCT } from '../../../apollo/user/query';

const AddProduct = ({ initialValues, ...props }: any) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const inputRef = useRef<any>(null);
	const [insertProductData, setInsertProductData] = useState<ProductInput>(initialValues);
	const [productType, setProductType] = useState<ProductType[]>(Object.values(ProductType));
	const [productLocation, setProductLocation] = useState<ProductLocation[]>(Object.values(ProductLocation));
	const [productOccasion, setProductOccasion] = useState<ProductOccasion[]>(Object.values(ProductOccasion));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const {
		loading: getProductLoading,
		data: getProductData,
		error: getProductError,
		refetch: getProductRefetch,
	} = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.productId },
	});

	/** LIFECYCLES **/
	useEffect(() => {
		setInsertProductData({
			...insertProductData,
			productTitle: getProductData?.getProduct ? getProductData?.getProduct?.productTitle : '',
			productPrice: getProductData?.getProduct ? getProductData?.getProduct?.productPrice : 0,
			productType: getProductData?.getProduct ? getProductData?.getProduct?.productType : '',
			productLocation: getProductData?.getProduct ? getProductData?.getProduct?.productLocation : '',
			productAddress: getProductData?.getProduct ? getProductData?.getProduct?.productAddress : '',
			productOccasion: getProductData?.getProduct ? getProductData?.getProduct?.productOccasion : '',
			productItemCount: getProductData?.getProduct ? getProductData?.getProduct?.productItemCount : 0,
			productDesc: getProductData?.getProduct ? getProductData?.getProduct?.productDesc : '',
			productImages: getProductData?.getProduct ? getProductData?.getProduct?.productImages : [],
		});
	}, [getProductLoading, getProductData]);

	/** HANDLERS **/
	async function uploadImages() {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current.files;

			if (selectedFiles.length == 0) return false;
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!');

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null, null, null, null, null],
						target: 'product',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]);
			}

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImages = response.data.data.imagesUploader;

			console.log('+responseImages: ', responseImages);
			setInsertProductData({ ...insertProductData, productImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		if (
			insertProductData.productTitle === '' ||
			insertProductData.productPrice === 0 || // @ts-ignore
			insertProductData.productType === '' || // @ts-ignore
			insertProductData.productLocation === '' || // @ts-ignore
			insertProductData.productAddress === '' || // @ts-ignore
			insertProductData.productOccasion === '' ||
			insertProductData.productItemCount === 0 ||
			insertProductData.productDesc === '' ||
			insertProductData.productImages.length === 0
		) {
			return true;
		}
	};

	const insertProductHandler = useCallback(async () => {
		try {
			const result = await createProduct({
				variables: {
					input: insertProductData,
				},
			});
			await sweetTopSuccessAlert('This product has been created succesfully.');
			await router.push({ pathname: '/mypage', query: { category: 'myProducts' } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertProductData]);

	const updateProductHandler = useCallback(async () => {
		try {
			//@ts-ignore
			insertProductData._id = getProductData?.getProduct?._id;
			const result = await updateProduct({
				variables: { input: insertProductData },
			});

			await sweetMixinSuccessAlert('This product has been updated successfully');
			await router.push({ pathname: '/mypage', query: { category: 'myProducts' } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertProductData]);

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	console.log('+insertProductData', insertProductData);

	const editing = Boolean(router.query.productId);

	return (
		<div id="add-product-page" className={'mp-tab'}>
			<MyPageHeader
				group={'Manage Listings'}
				title={editing ? 'Edit Product' : 'Add New Product'}
				desc={'Fill in the details buyers see on the product page'}
			/>

			<section className={'mp-card'}>
				<div className={'card-head'}>
					<div className={'card-title'}>
						<Inventory2OutlinedIcon aria-hidden />
						<h3>{t('Product details')}</h3>
					</div>
					<span className={'card-tag'}>{t('All fields required')}</span>
				</div>
				<div className={'form-grid'}>
					<label className={'field span-2'}>
						<span className={'field-label'}>{t('Title')}</span>
						<span className={'input-wrap'}>
							<input
								type="text"
								placeholder={t('e.g. Peach rose bouquet')}
								value={insertProductData.productTitle}
								onChange={({ target: { value } }) =>
									setInsertProductData({ ...insertProductData, productTitle: value })
								}
							/>
						</span>
					</label>
					<label className={'field'}>
						<span className={'field-label'}>{t('Price')}</span>
						<span className={'input-wrap'}>
							<span className={'prefix'}>$</span>
							<input
								type="text"
								placeholder={t('Price')}
								value={insertProductData.productPrice}
								onChange={({ target: { value } }) =>
									setInsertProductData({ ...insertProductData, productPrice: parseInt(value) })
								}
							/>
						</span>
					</label>
						<label className={'field'}>
							<span className={'field-label'}>{t('Product type')}</span>
							<span className={'input-wrap select-wrap'}>
								<select
									value={insertProductData.productType || 'select'}
									onChange={({ target: { value } }) =>
										// @ts-ignore
										setInsertProductData({ ...insertProductData, productType: value })
									}
								>
									<option disabled={true} value={'select'}>
										{t('Select')}
									</option>
									{productType.map((type: any) => (
										<option value={`${type}`} key={type}>
											{t(toLabel(type))}
										</option>
									))}
								</select>
								<ExpandMoreIcon className={'suffix-icon'} aria-hidden />
							</span>
						</label>
						<label className={'field'}>
							<span className={'field-label'}>{t('Location')}</span>
							<span className={'input-wrap select-wrap'}>
								<select
									value={insertProductData.productLocation || 'select'}
									onChange={({ target: { value } }) =>
										// @ts-ignore
										setInsertProductData({ ...insertProductData, productLocation: value })
									}
								>
									<option disabled={true} value={'select'}>
										{t('Select')}
									</option>
									{productLocation.map((location: any) => (
										<option value={`${location}`} key={location}>
											{t(toLabel(location))}
										</option>
									))}
								</select>
								<ExpandMoreIcon className={'suffix-icon'} aria-hidden />
							</span>
						</label>
					<label className={'field'}>
						<span className={'field-label'}>{t('Address')}</span>
						<span className={'input-wrap'}>
							<input
								type="text"
								placeholder={t('Address')}
								value={insertProductData.productAddress}
								onChange={({ target: { value } }) =>
									setInsertProductData({ ...insertProductData, productAddress: value })
								}
							/>
						</span>
					</label>
					<label className={'field'}>
						<span className={'field-label'}>{t('Item Count')}</span>
						<span className={'input-wrap'}>
							<input
								type="number"
								min={1}
								placeholder={t('Item Count')}
								value={insertProductData.productItemCount || ''}
								onChange={({ target: { value } }) =>
									setInsertProductData({ ...insertProductData, productItemCount: parseInt(value) || 0 })
								}
							/>
						</span>
					</label>
						<label className={'field'}>
							<span className={'field-label'}>{t('Occasion')}</span>
							<span className={'input-wrap select-wrap'}>
								<select
									value={insertProductData.productOccasion || 'select'}
									onChange={({ target: { value } }) =>
										// @ts-ignore
										setInsertProductData({ ...insertProductData, productOccasion: value })
									}
								>
									<option disabled={true} value={'select'}>
										{t('Select')}
									</option>
									{productOccasion.map((occasion: any) => (
										<option value={`${occasion}`} key={occasion}>
											{t(toLabel(occasion))}
										</option>
									))}
								</select>
								<ExpandMoreIcon className={'suffix-icon'} aria-hidden />
							</span>
						</label>
					<label className={'field span-2'}>
						<span className={'field-label'}>{t('Description')}</span>
						<textarea
							rows={5}
							placeholder={t('What is in it, how big it is, how long it stays fresh')}
							value={insertProductData.productDesc}
							onChange={({ target: { value } }) =>
								setInsertProductData({ ...insertProductData, productDesc: value })
							}
						></textarea>
					</label>
				</div>
			</section>

			<section className={'mp-card'}>
				<div className={'card-head'}>
					<div className={'card-title'}>
						<PhotoLibraryOutlinedIcon aria-hidden />
						<h3>{t('Photos')}</h3>
					</div>
					<span className={'card-tag'}>{insertProductData?.productImages.length} / 5</span>
				</div>
				<button type="button" className={'upload-zone'} onClick={() => inputRef.current.click()}>
					<CloudUploadOutlinedIcon aria-hidden />
					<strong>{t('Upload photos of your product')}</strong>
					<span>{t('Up to 5 images, JPG or PNG')}</span>
					<span className={'mp-btn mp-btn-secondary'}>{t('Browse Files')}</span>
				</button>
				<input
					ref={inputRef}
					type="file"
					hidden={true}
					onChange={uploadImages}
					multiple={true}
					accept="image/jpg, image/jpeg, image/png"
				/>
				{insertProductData?.productImages.length > 0 && (
					<div className={'upload-gallery'}>
						{insertProductData?.productImages.map((image: string, index: number) => {
							const imagePath: string = `${REACT_APP_API_URL}/${image}`;
							return (
								<span className={'gallery-item'} key={image}>
									<img src={imagePath} alt="" />
									{index === 0 && <small>{t('Cover')}</small>}
								</span>
							);
						})}
					</div>
				)}
			</section>

			<div className={'save-bar'}>
				<span>{doDisabledCheck() ? t('Fill in every field and add at least one photo') : t('Ready to save')}</span>
				{editing ? (
					<Button className="mp-btn mp-btn-primary" disabled={doDisabledCheck()} onClick={updateProductHandler}>
						{t('Save changes')}
					</Button>
				) : (
					<Button className="mp-btn mp-btn-primary" disabled={doDisabledCheck()} onClick={insertProductHandler}>
						{t('Publish product')}
					</Button>
				)}
			</div>
		</div>
	);
};

AddProduct.defaultProps = {
	initialValues: {
		productTitle: '',
		productPrice: 0,
		productType: '',
		productLocation: '',
		productAddress: '',
		productOccasion: '',
		productItemCount: 0,
		productDesc: '',
		productImages: [],
	},
};

export default AddProduct;
