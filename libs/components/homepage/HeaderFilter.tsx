import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { ProductLocation, ProductOccasion, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
};

interface HeaderFilterProps {
	initialInput: ProductsInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t, i18n } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const locationRef: any = useRef();
	const occasionRef: any = useRef();
	const typeRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openOccasion, setOpenOccasion] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [productLocation, setProductLocation] = useState<ProductLocation[]>(Object.values(ProductLocation));
	const [productOccasion, setProductOccasion] = useState<ProductOccasion[]>(Object.values(ProductOccasion));
	const [productType, setProductType] = useState<ProductType[]>(Object.values(ProductType));

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!occasionRef?.current?.contains(event.target)) {
				setOpenOccasion(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);

		return () => {
			document.removeEventListener('mousedown', clickHandler);
		};
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenOccasion(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenOccasion(false);
		setOpenType(false);
	};

	const occasionStateChangeHandler = () => {
		setOpenOccasion((prev) => !prev);
		setOpenLocation(false);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenOccasion(false);
	};

	const disableAllStateHandler = () => {
		setOpenType(false);
		setOpenOccasion(false);
		setOpenLocation(false);
	};

	const productLocationSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				occasionStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, productLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productOccasionSelectHandler = useCallback(
		async (value: ProductOccasion | null) => {
			try {
				const search = { ...searchFilter.search };
				if (value) search.occasionList = [value];
				else delete search.occasionList;
				setSearchFilter({ ...searchFilter, search });
				value ? typeStateChangeHandler() : disableAllStateHandler();
			} catch (err: any) {
				console.log('ERROR, productOccasionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const productTypeSelectHandler = useCallback(
		async (value: ProductType | null) => {
			try {
				const search = { ...searchFilter.search };
				if (value) search.typeList = [value];
				else delete search.typeList;
				setSearchFilter({ ...searchFilter, search });
				disableAllStateHandler();
			} catch (err: any) {
				console.log('ERROR, productTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
	};

	const pushSearchHandler = async () => {
		try {
			if (searchFilter?.search?.locationList?.length == 0) {
				delete searchFilter.search.locationList;
			}

			if (searchFilter?.search?.occasionList?.length == 0) {
				delete searchFilter.search.occasionList;
			}

			if (searchFilter?.search?.typeList?.length == 0) {
				delete searchFilter.search.typeList;
			}

			await router.push(
				`/product?input=${JSON.stringify(searchFilter)}`,
				`/product?input=${JSON.stringify(searchFilter)}`,
			);
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		return (
			<>
				<Stack className={'search-box'}>
					<Stack className={'select-box'}>
						<Box component={'div'} className={`box ${openLocation ? 'on' : ''}`} onClick={locationStateChangeHandler}>
							<span>{searchFilter?.search?.locationList ? searchFilter?.search?.locationList[0] : t('Location')} </span>
							<ExpandMoreIcon />
						</Box>
						<div className={'select-item'} ref={occasionRef}>
							<Box className={`box ${openOccasion ? 'on' : ''}`} onClick={occasionStateChangeHandler}>
								<span>{searchFilter?.search?.occasionList ? searchFilter?.search?.occasionList[0] : t('Occasion')} </span>
								<ExpandMoreIcon />
							</Box>
							<div className={`select-dropdown ${openOccasion ? 'on' : ''}`}>
								{productOccasion.map((occasion: ProductOccasion) => (
									<span
										key={occasion}
										className={searchFilter?.search?.occasionList?.[0] === occasion ? 'active' : ''}
										onClick={() => productOccasionSelectHandler(occasion)}
									>
										{occasion}
									</span>
								))}
							</div>
						</div>
						<div className={'select-item'} ref={typeRef}>
							<Box className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
								<span>{searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : t('Category')} </span>
								<ExpandMoreIcon />
							</Box>
							<div className={`select-dropdown ${openType ? 'on' : ''}`}>
								{productType.map((type: ProductType) => (
									<span
										key={type}
										className={searchFilter?.search?.typeList?.[0] === type ? 'active' : ''}
										onClick={() => productTypeSelectHandler(type)}
									>
										{type}
									</span>
								))}
							</div>
						</div>
					</Stack>
					<Stack className={'search-box-other'}>
						<Box className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
							<img src="/img/icons/tune.svg" alt="" />
							<span>{t('Advanced')}</span>
						</Box>
						<Box className={'search-btn'} onClick={pushSearchHandler}>
							<img src="/img/icons/search_white.svg" alt="" />
						</Box>
					</Stack>

					{/*MENU */}
					<div className={`filter-location ${openLocation ? 'on' : ''}`} ref={locationRef}>
						{productLocation.map((location: string) => {
							return (
								<div onClick={() => productLocationSelectHandler(location)} key={location}>
									<img src={`img/banner/cities/${location}.webp`} alt="" />
									<span>{location}</span>
								</div>
							);
						})}
					</div>
				</Stack>

				{/* ADVANCED FILTER MODAL */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					{/* @ts-ignore */}
					<Box sx={style}>
						<Box className={'advanced-filter-modal'}>
							<div className={'close'} onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</div>
							<div className={'top'}>
								<span>Find your product</span>
								<div className={'search-input-box'}>
									<img src="/img/icons/search.svg" alt="" />
									<input
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder={'What are you looking for?'}
										onChange={(e: any) => {
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: e.target.value },
											});
										}}
									/>
								</div>
							</div>
							<Divider sx={{ mt: '30px', mb: '35px' }} />
							<div className={'middle'}>
								<div className={'row-box'}>
									<div className={'box'}>
										<span>price range</span>
										<div className={'inside space-between align-center'}>
											<input
												type="number"
												min={0}
												placeholder="$ min"
												style={{ width: '122px' }}
												value={searchFilter?.search?.pricesRange?.start ?? 0}
												onChange={(e: any) =>
													setSearchFilter({
														...searchFilter,
														search: {
															...searchFilter.search,
															pricesRange: { start: Number(e.target.value), end: searchFilter?.search?.pricesRange?.end ?? 0 },
														},
													})
												}
											/>
											<div className={'minus-line'}></div>
											<input
												type="number"
												min={0}
												placeholder="$ max"
												style={{ width: '122px' }}
												value={searchFilter?.search?.pricesRange?.end ?? 0}
												onChange={(e: any) =>
													setSearchFilter({
														...searchFilter,
														search: {
															...searchFilter.search,
															pricesRange: { start: searchFilter?.search?.pricesRange?.start ?? 0, end: Number(e.target.value) },
														},
													})
												}
											/>
										</div>
									</div>
								</div>
							</div>
							<Divider sx={{ mt: '60px', mb: '18px' }} />
							<div className={'bottom'}>
								<div onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" />
									<span>Reset all filters</span>
								</div>
								<Button
									startIcon={<img src={'/img/icons/search.svg'} />}
									className={'search-btn'}
									onClick={pushSearchHandler}
								>
									Search
								</Button>
							</div>
						</Box>
					</Box>
				</Modal>
			</>
		);
	}
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default HeaderFilter;
