import React, { ReactNode } from 'react';

interface SectionHeadingProps {
	title: string;
	subtitle?: string;
	action?: ReactNode;
	id?: string;
}

const SectionHeading = (props: SectionHeadingProps) => {
	const { title, subtitle, action, id } = props;

	return (
		<header className={'section-heading'}>
			<div className={'section-heading__text'}>
				<h2 id={id}>{title}</h2>
				{subtitle && <p>{subtitle}</p>}
			</div>
			{action && <div className={'section-heading__action'}>{action}</div>}
		</header>
	);
};

export default SectionHeading;
