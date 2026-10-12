import React from 'react';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import SectionHeading from './SectionHeading';

interface EventData {
	eventTitle: string;
	city: string;
	description: string;
	imageSrc: string;
}

// Static content: the backend has no events API yet
const eventsData: EventData[] = [
	{
		eventTitle: 'Paradise City Theme Park',
		city: 'Incheon',
		description:
			'Experience magic and wonder in Incheon with a visit to the night-themed indoor theme park Wonderbox at Paradise City!',
		imageSrc: '/img/events/INCHEON.webp',
	},
	{
		eventTitle: 'Taebaeksan Snow Festival',
		city: 'Seoul',
		description: 'If you have the opportunity to travel to South Korea, do not miss the Taebaeksan Snow Festival!',
		imageSrc: '/img/events/SEOUL.webp',
	},
	{
		eventTitle: 'Suseong Lake Event',
		city: 'Daegu',
		description: 'The Suseong Lake Festival is a culture and arts festival held alongside Suseongmot Lake!',
		imageSrc: '/img/events/DAEGU.webp',
	},
	{
		eventTitle: 'Sand Festival',
		city: 'Busan',
		description:
			'Haeundae Sand Festival, the nation’s largest eco-friendly exhibition on sand, is held at Haeundae Beach!',
		imageSrc: '/img/events/BUSAN.webp',
	},
];

const Events = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') return null;

	return (
		<section className={'home-section events-section tinted'} aria-labelledby="events-title">
			<div className={'container'}>
				<SectionHeading
					id="events-title"
					eyebrow={t('● Around Korea')}
					title={t('Events')}
					subtitle={t('Seasonal festivals worth a bouquet or a box of chocolates')}
				/>
				<div className={'events-grid'}>
					{eventsData.map((event) => (
						<article className={'event-card'} key={event.eventTitle}>
							<img src={event.imageSrc} alt="" loading="lazy" />
							<div className={'event-shade'} aria-hidden />
							<div className={'event-top'}>
								<h3>{event.city}</h3>
								<p>{event.eventTitle}</p>
							</div>
							<p className={'event-desc'}>{event.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
};

export default Events;
