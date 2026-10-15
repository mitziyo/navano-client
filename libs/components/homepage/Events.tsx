import React from 'react';
import { useTranslation } from 'next-i18next';
import SectionHeading from './SectionHeading';

interface EventData {
	date: string;
	title: string;
	description: string;
	imageSrc: string;
}

// Static gifting calendar: the backend has no events API
const eventsData: EventData[] = [
	{
		date: 'Feb 14 · Mar 14',
		title: "Valentine's & White Day",
		description: 'Handmade chocolates and red roses for the two sweetest days of spring.',
		imageSrc: '/img/banner/product-hero.jpg',
	},
	{
		date: 'May 8',
		title: "Parents' Day",
		description: 'Carnations and a cake from a local bakery to say thank you.',
		imageSrc: '/img/banner/hero-florist.jpg',
	},
	{
		date: 'Nov 11',
		title: 'Pepero Day',
		description: 'Chocolate sticks and sweet boxes to share with friends and colleagues.',
		imageSrc: '/img/banner/hero-chocolatier.jpg',
	},
	{
		date: 'Dec 25',
		title: 'Christmas',
		description: 'Celebration cakes and winter bouquets for the end of the year.',
		imageSrc: '/img/banner/hero-atelier.jpg',
	},
];

const Events = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'home-section events-section tinted'} aria-labelledby="events-title">
			<div className={'container'}>
				<SectionHeading
					id="events-title"
					eyebrow={t('● Gifting calendar')}
					title={t('Events')}
					subtitle={t('Dates worth a bouquet, a box of chocolates or a cake')}
				/>
				<div className={'events-grid'}>
					{eventsData.map((event) => (
						<article className={'event-card'} key={event.title}>
							<img src={event.imageSrc} alt="" loading="lazy" />
							<div className={'event-shade'} aria-hidden />
							<div className={'event-top'}>
								<p>{event.date}</p>
								<h3>{t(event.title)}</h3>
							</div>
							<p className={'event-desc'}>{t(event.description)}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
};

export default Events;
