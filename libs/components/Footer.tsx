import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Stack, Box } from '@mui/material';
import moment from 'moment';
import NavanoLogo from './common/NavanoLogo';
import { ProductLocation, ProductType } from '../enums/product.enum';

// Product search link with one filter preset, in the format /product reads from ?input=
const productSearch = (search: Record<string, string[]>) => ({
	pathname: '/product',
	query: { input: JSON.stringify({ page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search }) },
});

const popularSearch = [
	{ label: 'Flowers & Bouquets', href: productSearch({ typeList: [ProductType.FLOWER] }) },
	{ label: 'Chocolates', href: productSearch({ typeList: [ProductType.CHOCOLATE] }) },
	{ label: 'Celebration Cakes', href: productSearch({ typeList: [ProductType.CAKE] }) },
];

const quickLinks = [
	{ label: 'All Products', href: '/product' },
	{ label: 'Stores', href: '/agent' },
	{ label: 'Community', href: '/community?articleCategory=FREE' },
	{ label: 'Notices', href: '/cs?tab=notice' },
	{ label: 'FAQs', href: '/cs?tab=faq' },
];

const discover = [ProductLocation.SEOUL, ProductLocation.BUSAN, ProductLocation.INCHEON, ProductLocation.JEJU].map(
	(location) => ({
		label: location.charAt(0) + location.slice(1).toLowerCase(),
		href: productSearch({ locationList: [location] }),
	}),
);

const socials = [
	{ label: 'Facebook', icon: <FacebookOutlinedIcon /> },
	{ label: 'Telegram', icon: <TelegramIcon /> },
	{ label: 'Instagram', icon: <InstagramIcon /> },
	{ label: 'Twitter', icon: <TwitterIcon /> },
];

const Footer = () => {
	const { t } = useTranslation('common');

	return (
		<footer className={'site-footer'}>
			<div className={'container'}>
				<div className={'footer-top'}>
					<div className={'footer-brand'}>
						<Link href={'/'} className={'brand'} aria-label={'Navano home'}>
							<NavanoLogo variant={'mark'} width={34} height={34} />
							<strong>NAVANO</strong>
						</Link>
						<div className={'contact'}>
							<span className={'contact-label'}>{t('Customer care')}</span>
							<a href="tel:+821048672909" className={'contact-phone'}>
								+82 10 4867 2909
							</a>
						</div>
						<div className={'contact'}>
							<span className={'contact-label'}>{t('Questions about an order?')}</span>
							<Link href={'/cs?tab=faq'} className={'contact-link'}>
								{t('Visit the help center')}
							</Link>
						</div>
						<div className={'social'}>
							<span className={'contact-label'}>{t('Follow us on social media')}</span>
							<div className={'social-icons'}>
								{socials.map((social) => (
									<span key={social.label} className={'social-icon'} aria-label={social.label} role={'img'}>
										{social.icon}
									</span>
								))}
							</div>
						</div>
					</div>

					<div className={'footer-right'}>
						<div className={'newsletter'}>
							<strong>{t('Keep yourself up to date')}</strong>
							<p>{t('New bouquets, seasonal cakes and chocolate boxes from our stores, once a week')}</p>
							<form className={'newsletter-form'} onSubmit={(e) => e.preventDefault()}>
								<input type="email" placeholder={t('Your email address')} aria-label={t('Your email address')} />
								<button type="submit">{t('Subscribe')}</button>
							</form>
						</div>

						<div className={'footer-columns'}>
							<div>
								<h4>{t('Popular Search')}</h4>
								<ul>
									{popularSearch.map((item) => (
										<li key={item.label}>
											<Link href={item.href}>{t(item.label)}</Link>
										</li>
									))}
								</ul>
							</div>
							<div>
								<h4>{t('Quick Links')}</h4>
								<ul>
									{quickLinks.map((item) => (
										<li key={item.label}>
											<Link href={item.href}>{t(item.label)}</Link>
										</li>
									))}
								</ul>
							</div>
							<div>
								<h4>{t('Discover')}</h4>
								<ul>
									{discover.map((item) => (
										<li key={item.label}>
											<Link href={item.href}>{t(item.label)}</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div className={'footer-bottom'}>
					<p>
						© {moment().year()} Navano. {t('All rights reserved')}
					</p>
					<div className={'footer-legal'}>
						<Link href={'/cs?tab=notice'}>{t('Privacy')}</Link>
						<Link href={'/cs?tab=notice'}>{t('Terms')}</Link>
						<Link href={'/cs?tab=faq'}>{t('Help')}</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
