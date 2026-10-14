import React, { useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import SearchIcon from '@mui/icons-material/Search';
import { ProductLocation, ProductOccasion, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { toLabel } from './productLabels';

// Dropdown springs open from the top, options stagger in
const dropdownVariants = {
	closed: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } },
	open: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: 'spring' as const, stiffness: 420, damping: 30, staggerChildren: 0.02, delayChildren: 0.02 },
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

const modalStyle = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'var(--nv-surface)',
	color: 'var(--nv-ink)',
	border: '1px solid var(--nv-line-soft)',
	borderRadius: '16px',
	outline: 'none',
	boxShadow: 24,
};

const DEFAULT_PRICE_END = 2000000;

type Field = 'location' | 'occasion' | 'type' | null;

interface HeaderFilterProps {
	initialInput: ProductsInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<ProductsInquiry>(initialInput);
	const [openField, setOpenField] = useState<Field>(null);
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const consoleRef = useRef<HTMLDivElement>(null);
	const productLocations = Object.values(ProductLocation);
	const productOccasions = Object.values(ProductOccasion);
	const productTypes = Object.values(ProductType);

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!consoleRef.current?.contains(event.target as Node)) setOpenField(null);
		};
		const keyHandler = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpenField(null);
		};

		document.addEventListener('mousedown', clickHandler);
		document.addEventListener('keydown', keyHandler);
		return () => {
			document.removeEventListener('mousedown', clickHandler);
			document.removeEventListener('keydown', keyHandler);
		};
	}, []);

	/** HANDLERS **/
	const toggleField = (field: Field) => setOpenField((prev) => (prev === field ? null : field));

	const advancedFilterHandler = (status: boolean) => {
		setOpenField(null);
		setOpenAdvancedFilter(status);
	};

	// Picking a value moves on to the next field; picking the selected value again (null) clears the filter
	const selectHandler = (key: 'locationList' | 'occasionList' | 'typeList', value: string | null, next: Field) => {
		setSearchFilter((prev) => {
			const search: any = { ...prev.search };
			if (value) search[key] = [value];
			else delete search[key];
			return { ...prev, search };
		});
		setOpenField(value ? next : null);
	};

	const priceChangeHandler = (edge: 'start' | 'end', value: string) => {
		setSearchFilter((prev) => {
			const current = prev.search.pricesRange ?? { start: 0, end: DEFAULT_PRICE_END };
			const parsed = value === '' ? (edge === 'start' ? 0 : DEFAULT_PRICE_END) : Math.max(0, Number(value));
			return { ...prev, search: { ...prev.search, pricesRange: { ...current, [edge]: parsed } } };
		});
	};

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
	};

	const pushSearchHandler = async () => {
		try {
			const search = { ...searchFilter.search };
			if (!search.locationList?.length) delete search.locationList;
			if (!search.occasionList?.length) delete search.occasionList;
			if (!search.typeList?.length) delete search.typeList;
			if (!search.text?.trim()) delete search.text;

			// A query object lets Next encode the JSON, so text with & # % survives the URL
			setOpenField(null);
			setOpenAdvancedFilter(false);
			await router.push({ pathname: '/product', query: { input: JSON.stringify({ ...searchFilter, search }) } });
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	const location = searchFilter?.search?.locationList?.[0];
	const occasion = searchFilter?.search?.occasionList?.[0];
	const type = searchFilter?.search?.typeList?.[0];

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		return (
			<MotionConfig reducedMotion="user">
				<div className={'search-console'} ref={consoleRef}>
					<div className={'console-field'}>
						<span className={'field-label'} id={'filter-location'}>
							{t('Location')}
						</span>
						<button
							type="button"
							className={`field-select ${openField === 'location' ? 'on' : ''} ${location ? 'has-value' : ''}`}
							aria-haspopup="listbox"
							aria-expanded={openField === 'location'}
							aria-labelledby={'filter-location'}
							onClick={() => toggleField('location')}
						>
							<span>{location ? toLabel(location) : t('All locations')}</span>
							<ExpandMoreIcon />
						</button>
						<AnimatePresence>
							{openField === 'location' && (
								<motion.div className={'field-dropdown city-grid'} role="listbox" {...dropdownMotion}>
									{productLocations.map((value) => (
										<motion.button
											type="button"
											key={value}
											variants={optionVariants}
											role="option"
											aria-selected={location === value}
											className={`city ${location === value ? 'active' : ''}`}
											onClick={() => selectHandler('locationList', location === value ? null : value, 'occasion')}
										>
											<img src={`/img/banner/cities/${value}.webp`} alt="" loading="lazy" />
											<span>{toLabel(value)}</span>
										</motion.button>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className={'console-field'}>
						<span className={'field-label'} id={'filter-occasion'}>
							{t('Occasion')}
						</span>
						<button
							type="button"
							className={`field-select ${openField === 'occasion' ? 'on' : ''} ${occasion ? 'has-value' : ''}`}
							aria-haspopup="listbox"
							aria-expanded={openField === 'occasion'}
							aria-labelledby={'filter-occasion'}
							onClick={() => toggleField('occasion')}
						>
							<span>{occasion ? t(toLabel(occasion)) : t('All occasions')}</span>
							<ExpandMoreIcon />
						</button>
						<AnimatePresence>
							{openField === 'occasion' && (
								<motion.div className={'field-dropdown'} role="listbox" {...dropdownMotion}>
									{productOccasions.map((value) => (
										<motion.button
											type="button"
											key={value}
											variants={optionVariants}
											role="option"
											aria-selected={occasion === value}
											className={occasion === value ? 'active' : ''}
											onClick={() => selectHandler('occasionList', occasion === value ? null : value, 'type')}
										>
											{t(toLabel(value))}
										</motion.button>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className={'console-field'}>
						<span className={'field-label'} id={'filter-type'}>
							{t('Category')}
						</span>
						<button
							type="button"
							className={`field-select ${openField === 'type' ? 'on' : ''} ${type ? 'has-value' : ''}`}
							aria-haspopup="listbox"
							aria-expanded={openField === 'type'}
							aria-labelledby={'filter-type'}
							onClick={() => toggleField('type')}
						>
							<span>{type ? t(toLabel(type)) : t('All categories')}</span>
							<ExpandMoreIcon />
						</button>
						<AnimatePresence>
							{openField === 'type' && (
								<motion.div className={'field-dropdown'} role="listbox" {...dropdownMotion}>
									{productTypes.map((value) => (
										<motion.button
											type="button"
											key={value}
											variants={optionVariants}
											role="option"
											aria-selected={type === value}
											className={type === value ? 'active' : ''}
											onClick={() => selectHandler('typeList', type === value ? null : value, null)}
										>
											{t(toLabel(value))}
										</motion.button>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className={'console-actions'}>
						<button type="button" className={'advanced-btn'} onClick={() => advancedFilterHandler(true)}>
							<TuneIcon />
							<span>{t('Advanced')}</span>
						</button>
						<button type="button" className={'search-btn'} onClick={pushSearchHandler} aria-label={t('Search')}>
							<SearchIcon />
						</button>
					</div>
				</div>

				{/* ADVANCED FILTER MODAL */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="advanced-filter-title"
				>
					<Box sx={modalStyle}>
						<Box className={'advanced-filter-modal'}>
							<button type="button" className={'close'} onClick={() => advancedFilterHandler(false)} aria-label="Close">
								<CloseIcon />
							</button>
							<div className={'top'}>
								<span id="advanced-filter-title">{t('Find your product')}</span>
								<div className={'search-input-box'}>
									<SearchIcon />
									<input
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder={t('What are you looking for?')}
										onChange={(e) =>
											setSearchFilter((prev) => ({ ...prev, search: { ...prev.search, text: e.target.value } }))
										}
										onKeyDown={(e) => e.key === 'Enter' && pushSearchHandler()}
									/>
								</div>
							</div>
							<Divider sx={{ mt: '30px', mb: '35px' }} />
							<div className={'middle'}>
								<div className={'row-box'}>
									<div className={'box'}>
										<span>{t('Price range')}</span>
										<div className={'inside space-between align-center'}>
											<input
												type="number"
												min={0}
												placeholder="$ min"
												style={{ width: '122px' }}
												value={searchFilter?.search?.pricesRange?.start ?? ''}
												onChange={(e) => priceChangeHandler('start', e.target.value)}
											/>
											<div className={'minus-line'}></div>
											<input
												type="number"
												min={0}
												placeholder="$ max"
												style={{ width: '122px' }}
												value={searchFilter?.search?.pricesRange?.end ?? ''}
												onChange={(e) => priceChangeHandler('end', e.target.value)}
											/>
										</div>
									</div>
								</div>
							</div>
							<Divider sx={{ mt: '60px', mb: '18px' }} />
							<Stack className={'bottom'}>
								<div onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" />
									<span>{t('Reset all filters')}</span>
								</div>
								<Button startIcon={<SearchIcon />} className={'search-btn'} onClick={pushSearchHandler}>
									{t('Search')}
								</Button>
							</Stack>
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
				end: DEFAULT_PRICE_END,
			},
		},
	},
};

export default HeaderFilter;
