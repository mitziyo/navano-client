import React from 'react';
import { useTranslation } from 'next-i18next';

interface MyPageHeaderProps {
	group: string;
	title: string;
	desc: string;
	actions?: React.ReactNode;
}

// Tab header in the My Profile style: breadcrumb, page title, description and actions
const MyPageHeader = ({ group, title, desc, actions }: MyPageHeaderProps) => {
	const { t } = useTranslation('common');

	return (
		<header className={'profile-header'}>
			<div>
				<nav className={'breadcrumb'} aria-label={'breadcrumb'}>
					<span>{t('Account')}</span>
					<span className={'sep'}>/</span>
					<span>{t(group)}</span>
					<span className={'sep'}>/</span>
					<span className={'current'}>{t(title)}</span>
				</nav>
				<h1 className={'page-title'}>{t(title)}</h1>
				<p className={'page-desc'}>{t(desc)}</p>
			</div>
			{actions && <div className={'header-actions'}>{actions}</div>}
		</header>
	);
};

export default MyPageHeader;
