import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

// Placeholder cards shaped like the real ones while the first request is in flight
export const CardSkeletons = ({ count = 4, variant = 'product' }: { count?: number; variant?: 'product' | 'store' }) => (
	<div className={`card-skeletons card-skeletons--${variant}`} aria-busy="true" aria-live="polite">
		{Array.from({ length: count }).map((_, index) => (
			<div className={'skeleton-card'} key={index}>
				<div className={'skeleton-block media'} />
				<div className={'skeleton-block line'} />
				<div className={'skeleton-block line short'} />
			</div>
		))}
	</div>
);

interface EmptyStateProps {
	title: string;
	href?: string;
	linkLabel?: string;
}

export const EmptyState = ({ title, href = '/product', linkLabel }: EmptyStateProps) => {
	const { t } = useTranslation('common');

	return (
		<div className={'empty-state'}>
			<p>{title}</p>
			<Link href={href} className={'btn-text'}>
				{linkLabel ?? t('Browse all products')}
			</Link>
		</div>
	);
};
