import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { ProductLocation, ProductOccasion, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';

// Liquid-glass dropdown: springs open from the top, options stagger in
const dropdownVariants = {
	closed: { opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.12 } },
	open: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: 'spring' as const, stiffness: 420, damping: 30, staggerChildren: 0.025, delayChildren: 0.02 },
	},
};

const optionVariants = {
	closed: { opacity: 0, y: -4 },
	open: { opacity: 1, y: 0 },
};

const dropdownMotion = {
	variants: dropdownVariants,
	initial: 'closed',
	animate: 'open',
	exit: 'closed',
	style: { transformOrigin: 'top center' },
};

const chipMotion = { whileHover: { y: -1 }, whileTap: { scale: 0.97 } };

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
	const locationBoxRef: any = useRef();
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
			if (!locationRef?.current?.contains(event.target) && !locationBoxRef?.current?.contains(event.target)) {
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
			<MotionConfig reducedMotion="user">
				<Stack className={'search-box'}>
					<Stack className={'select-box'}>
						<motion.div
							ref={locationBoxRef}
							className={`box ${openLocation ? 'on' : ''}`}
							onClick={locationStateChangeHandler}
							{...chipMotion}
						>
							<span>{searchFilter?.search?.locationList ? searchFilter?.search?.locationList[0] : t('Location')} </span>
							<ExpandMoreIcon />
						</motion.div>
						<div className={'select-item'} ref={occasionRef}>
							<motion.div
								className={`box ${openOccasion ? 'on' : ''}`}
								onClick={occasionStateChangeHandler}
								{...chipMotion}
							>
								<span>
									{searchFilter?.search?.occasionList ? searchFilter?.search?.occasionList[0] : t('Occasion')}{' '}
								</span>
								<ExpandMoreIcon />
							</motion.div>
							<AnimatePresence>
								{openOccasion && (
									<motion.div className={'select-dropdown'} {...dropdownMotion}>
										{productOccasion.map((occasion: ProductOccasion) => (
											<motion.span
												key={occasion}
												variants={optionVariants}
												className={searchFilter?.search?.occasionList?.[0] === occasion ? 'active' : ''}
												onClick={() => productOccasionSelectHandler(occasion)}
											>
												{occasion}
											</motion.span>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
						<div className={'select-item'} ref={typeRef}>
							<motion.div className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler} {...chipMotion}>
								<span>{searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : t('Category')} </span>
								<ExpandMoreIcon />
							</motion.div>
							<AnimatePresence>
								{openType && (
									<motion.div className={'select-dropdown'} {...dropdownMotion}>
										{productType.map((type: ProductType) => (
											<motion.span
												key={type}
												variants={optionVariants}
												className={searchFilter?.search?.typeList?.[0] === type ? 'active' : ''}
												onClick={() => productTypeSelectHandler(type)}
											>
												{type}
											</motion.span>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</Stack>
					<Stack className={'search-box-other'}>
						<motion.div
							className={'advanced-filter'}
							onClick={() => advancedFilterHandler(true)}
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
						>
							<img src="/img/icons/tune.svg" alt="" />
							<span>{t('Advanced')}</span>
						</motion.div>
						<motion.div
							className={'search-btn'}
							onClick={pushSearchHandler}
							whileHover={{ scale: 1.06 }}
							whileTap={{ scale: 0.94 }}
						>
							<img src="/img/icons/search_white.svg" alt="" />
						</motion.div>
					</Stack>

					{/*MENU */}
					<AnimatePresence>
						{openLocation && (
							<motion.div className={'filter-location'} ref={locationRef} {...dropdownMotion}>
								{productLocation.map((location: string) => {
									return (
										<motion.div
											variants={optionVariants}
											onClick={() => productLocationSelectHandler(location)}
											key={location}
										>
											<img src={`img/banner/cities/${location}.webp`} alt="" />
											<span>{location}</span>
										</motion.div>
									);
								})}
							</motion.div>
						)}
					</AnimatePresence>
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
															pricesRange: {
																start: Number(e.target.value),
																end: searchFilter?.search?.pricesRange?.end ?? 0,
															},
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
															pricesRange: {
																start: searchFilter?.search?.pricesRange?.start ?? 0,
																end: Number(e.target.value),
															},
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
			</MotionConfig>
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
