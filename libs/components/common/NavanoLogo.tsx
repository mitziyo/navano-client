import React from 'react';

interface NavanoLogoProps {
	variant?: 'full' | 'mark';
	className?: string;
	width?: number;
	height?: number;
}

const PETAL_ANGLES = [0, 72, 144, 216, 288];

const LETTERS = [
	'M48.5 33V19L58.5 33V19',
	'M62 33L67 19L72 33M63.8 28H70.2',
	'M75.5 19L80.5 33L85.5 19',
	'M89 33L94 19L99 33M90.8 28H97.2',
	'M102.5 33V19L112.5 33V19',
];

const Mark = ({ y = 0 }: { y?: number }) => (
	<svg className={'mark'} x={0} y={y} width={40} height={40} viewBox="0 0 40 40" overflow="visible">
		<circle className={'badge'} cx="20" cy="20" r="20" fill="#EB6753" />
		<g className={'petals'}>
			<g className={'petals-bloom'} fill="white">
				{PETAL_ANGLES.map((angle) => (
					<ellipse key={angle} cx="20" cy="12.8" rx="4.2" ry="6.6" transform={`rotate(${angle} 20 20)`} />
				))}
			</g>
		</g>
		<path
			className={'heart'}
			d="M20 23.4C17.1 21.4 16.3 20 16.3 18.8C16.3 17.6 17.2 16.7 18.3 16.7C19 16.7 19.6 17.1 20 17.7C20.4 17.1 21 16.7 21.7 16.7C22.8 16.7 23.7 17.6 23.7 18.8C23.7 20 22.9 21.4 20 23.4Z"
			fill="#EB6753"
		/>
	</svg>
);

const NavanoLogo = (props: NavanoLogoProps) => {
	const { variant = 'full', className = '', width, height } = props;

	if (variant === 'mark') {
		return (
			<svg
				className={`navano-logo ${className}`}
				width={width ?? 40}
				height={height ?? 40}
				viewBox="0 0 40 40"
				fill="none"
				role="img"
				aria-label="Navano"
			>
				<Mark />
			</svg>
		);
	}

	return (
		<svg
			className={`navano-logo ${className}`}
			width={width ?? 129}
			height={height ?? 52}
			viewBox="0 0 129 52"
			fill="none"
			role="img"
			aria-label="Navano"
		>
			<Mark y={6} />
			<g stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
				{LETTERS.map((d, i) => (
					<path key={i} className={'letter'} d={d} style={{ '--i': i } as React.CSSProperties} />
				))}
				<ellipse className={'letter'} cx="121.5" cy="26" rx="5.5" ry="7" style={{ '--i': 5 } as React.CSSProperties} />
			</g>
		</svg>
	);
};

export default NavanoLogo;
