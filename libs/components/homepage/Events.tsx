import React from 'react';
import { useTranslation } from 'next-i18next';
import SectionHeading from './SectionHeading';

interface EventData {
	tag: string;
	title: string;
	description: string;
	imageSrc: string;
}

// Static: celebrations our stores supply flowers and sweets for (the backend has no events API)
const eventsData: EventData[] = [
	{
		tag: 'Weddings · Parties',
		title: 'Dessert Tables',
		description: 'Tiered cakes, cupcakes and berry tarts from our bakers, set up for your celebration.',
		imageSrc: '/img/events/cakesevent.jpg',
	},
	{
		tag: 'Birthdays · Corporate',
		title: 'Chocolate Fountain Bar',
		description: 'A flowing chocolate fountain with truffles, cake pops and fresh fruit from our chocolatiers.',
		imageSrc: '/img/events/chocoevent.jpg',
	},
	{
		tag: 'Weddings',
		title: 'Garden Wedding',
		description: 'Centerpieces and table flowers for an evening reception under the lanterns.',
		imageSrc: '/img/events/event-wedding.jpg',
	},
	{
		tag: 'Picnics · Birthdays',
		title: 'Picnic Party',
		description: 'Daisies in vases, low tables and lanterns — flowers and sweets for a party outdoors.',
		imageSrc: '/img/events/event-party.jpg',
	},
];

const Events = () => {
	const { t } = useTranslation('common');

	return (
		<section className={'home-section events-section tinted'} aria-labelledby="events-title">
			<div className={'container'}>
				<SectionHeading
					id="events-title"
					eyebrow={t('● Celebrations')}
					title={t('Events')}
					subtitle={t('Flowers, cakes and chocolates for the moments you celebrate')}
				/>
				<div className={'events-grid'}>
					{eventsData.map((event) => (
						<article className={'event-card'} key={event.title}>
							<img src={event.imageSrc} alt="" loading="lazy" />
							<div className={'event-shade'} aria-hidden />
							<div className={'event-top'}>
								<p>{t(event.tag)}</p>
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
