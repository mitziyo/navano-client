import React from 'react';
import { useTranslation } from 'next-i18next';
import HeaderFilter from './HeaderFilter';

const HeroSection = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'home-hero'} aria-labelledby="hero-title">
			{/* Full-bleed band: bouquet photo on the right fading into the band, copy on the page grid */}
			<div className={'hero-card'}>
				<div className={'hero-media'} aria-hidden>
					<img src={'/img/banner/product-hero.jpg'} alt="" />
				</div>

				<div className={'container hero-inner'}>
					<div className={'hero-copy'}>
						<span className={'hero-badge'}>
							<span className={'pulse'} aria-hidden />
							{t('Handmade by local stores')}
						</span>
						<h1 id="hero-title">{t('Flowers, cakes & chocolates for every occasion')}</h1>
						<p>
							{t(
								'Fresh bouquets, celebration cakes and handmade chocolates from independent florists, bakers and chocolatiers near you',
							)}
						</p>
					</div>
				</div>
			</div>

			<div className={'container'}>
				<div className={'hero-search'}>
					<HeaderFilter />
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
