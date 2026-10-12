import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import HeaderFilter from './HeaderFilter';

// One orchestrated entrance, done in CSS (.hero-rise) so the copy is visible from the first paint, before hydration
const rise = (step: number) => ({ className: 'hero-rise', style: { '--step': step } as React.CSSProperties });

const HeroArt = () => (
	<div className={'hero-art'} aria-hidden>
		<span className={'arch'} />
		<span className={'sun'} />
		<span className={'stem'} />
		<span className={'petal p1'} />
		<span className={'petal p2'} />
		<span className={'petal p3'} />
		<span className={'petal p4'} />
		<span className={'petal p5'} />
		<span className={'leaf l1'} />
		<span className={'leaf l2'} />
	</div>
);

const HeroSection = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	const facts = [t('Flowers, chocolates and cakes'), t('Delivery in 9 cities'), t('Independent local stores')];

	return (
		<section className={`header-main hero ${device === 'mobile' ? 'hero--compact' : ''}`} aria-labelledby="hero-title">
			<div className={'hero-grain'} aria-hidden />
			<div className={'container'}>
				<div className={'hero-copy'}>
					<p {...rise(0)} className={'hero-eyebrow hero-rise'}>
						{t('For birthdays, weddings, anniversaries and holidays')}
					</p>
					<h1 id="hero-title" {...rise(1)}>
						{t('Gifts from local florists, chocolatiers and bakers')}
					</h1>
					<p {...rise(2)} className={'hero-lede hero-rise'}>
						{t(
							'Fresh bouquets, handmade chocolate and celebration cakes from independent stores. Choose the occasion and find something they will remember.',
						)}
					</p>
					<div {...rise(3)} className={'hero-actions hero-rise'}>
						<Link href={'/product'} className={'btn-primary'}>
							{t('Shop now')}
						</Link>
						{device !== 'mobile' && (
							<Link href={'/agent'} className={'btn-secondary'}>
								{t('Browse stores')}
							</Link>
						)}
					</div>
					<ul {...rise(4)} className={'hero-facts hero-rise'}>
						{facts.map((fact) => (
							<li key={fact}>{fact}</li>
						))}
					</ul>
				</div>

				{device !== 'mobile' && <HeroArt />}

				{device !== 'mobile' && (
					<div {...rise(5)} className={'hero-search hero-rise'}>
						<HeaderFilter />
					</div>
				)}
			</div>
		</section>
	);
};

export default HeroSection;
