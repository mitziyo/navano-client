import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useReducedMotion } from 'framer-motion';
import HeaderFilter from './HeaderFilter';

const SLIDE_INTERVAL = 6000;

// The copy stays the same across slides; position keeps the subject in the wide crop
const slides = [
	{ src: '/img/banner/hero-atelier.jpg', alt: 'Tiered wedding cake with roses and truffles', position: 'center 8%' },
	{ src: '/img/fiber/img1.jpg', alt: 'Bouquet of pink roses', position: 'center' },
	{ src: '/img/fiber/img3.jpg', alt: 'Handmade chocolates in a gift box', position: 'center' },
];

const pad = (n: number) => String(n).padStart(2, '0');

const HeroSection = () => {
	const { t } = useTranslation('common');
	const reduceMotion = useReducedMotion();
	const [active, setActive] = useState(0);

	/** LIFECYCLES **/
	useEffect(() => {
		if (reduceMotion) return;
		const timer = setInterval(() => setActive((prev) => (prev + 1) % slides.length), SLIDE_INTERVAL);
		return () => clearInterval(timer);
	}, [reduceMotion, active]);

	return (
		<section className={'home-hero'} aria-labelledby="hero-title">
			<div className={'container'}>
				<div className={'hero-card'}>
					{slides.map((slide, index) => (
						<img
							key={slide.src}
							src={slide.src}
							alt={index === active ? t(slide.alt) : ''}
							aria-hidden={index !== active}
							className={`hero-slide ${index === active ? 'is-active' : ''}`}
							style={{ objectPosition: slide.position }}
							loading={index === 0 ? 'eager' : 'lazy'}
						/>
					))}
					<div className={'hero-shade'} aria-hidden />

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

					<div className={'hero-dots'} role={'tablist'} aria-label={t('Hero images')}>
						{slides.map((slide, index) => (
							<button
								key={slide.src}
								type="button"
								role={'tab'}
								aria-selected={index === active}
								aria-label={`${index + 1} / ${slides.length}`}
								className={index === active ? 'is-active' : ''}
								onClick={() => setActive(index)}
							/>
						))}
						<span className={'hero-count'}>
							{pad(active + 1)} / {pad(slides.length)}
						</span>
					</div>
				</div>

				<div className={'hero-search'}>
					<HeaderFilter />
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
