import React, { useId } from 'react';

interface NavanoLogoProps {
	variant?: 'full' | 'mark';
	className?: string;
	width?: number;
	height?: number;
}

/*
 * Navano crest: a gold octagonal seal holding a five-petal bloom (flowers) around a
 * ruby heart (chocolates, cakes and gifting). Drawn on a 220 x 220 grid centred at 110,110;
 * strokes are heavier than a print crest so the mark still reads at 32-40px.
 */
const OCTAGON = '110,5 184,36 215,110 184,184 110,215 36,184 5,110 36,36';
const GOLD_PETALS = [
	'M 110,42 C 96,60 96,82 110,98 C 124,82 124,60 110,42 Z',
	'M 168,78 C 148,72 132,86 120,104 C 138,112 158,102 168,78 Z',
	'M 146,158 C 136,140 118,134 104,146 C 114,162 130,170 146,158 Z',
	'M 74,158 C 90,170 106,162 116,146 C 102,134 84,140 74,158 Z',
	'M 52,78 C 62,102 82,112 100,104 C 88,86 72,72 52,78 Z',
];
const BLUSH_PETAL = 'M 0,-48 C 16,-34 20,-14 0,0 C -20,-14 -16,-34 0,-48 Z';
const HEART = 'M 0,9 C -10,3 -11,-5 -5,-8 C -2,-9 0,-6 0,-4 C 0,-6 2,-9 5,-8 C 11,-5 10,3 0,9 Z';
const STARS = [
	[110, 17],
	[110, 203],
	[17, 110],
	[203, 110],
];

const Crest = ({ uid, size, x = 0, y = 0 }: { uid: string; size: number; x?: number; y?: number }) => (
	<svg className={'mark'} x={x} y={y} width={size} height={size} viewBox="0 0 220 220" overflow="visible">
		<defs>
			<linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#FCEFD2" />
				<stop offset="25%" stopColor="#E5BA73" />
				<stop offset="50%" stopColor="#C59341" />
				<stop offset="75%" stopColor="#F2D8A7" />
				<stop offset="100%" stopColor="#996E26" />
			</linearGradient>
			<linearGradient id={`${uid}-rose`} x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stopColor="#FF9EAA" />
				<stop offset="50%" stopColor="#E05368" />
				<stop offset="100%" stopColor="#9C2237" />
			</linearGradient>
			<linearGradient id={`${uid}-blush`} x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stopColor="#FFE4D6" stopOpacity="0.95" />
				<stop offset="100%" stopColor="#D97762" stopOpacity="0.5" />
			</linearGradient>
		</defs>

		<polygon className={'seal'} points={OCTAGON} fill="#121618" stroke={`url(#${uid}-gold)`} strokeWidth="7" />
		<circle cx="110" cy="110" r="86" fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="2.5" strokeOpacity="0.45" />
		{STARS.map(([cx, cy]) => (
			<circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill={`url(#${uid}-gold)`} />
		))}

		<g className={'petals'}>
			{/* Invisible disc keeps the rotation centred on the seal */}
			<circle cx="110" cy="110" r="70" fill="none" />
			{GOLD_PETALS.map((d) => (
				<path key={d} d={d} fill={`url(#${uid}-gold)`} />
			))}
			<g transform="translate(110 110)">
				{[0, 72, 144, 216, 288].map((angle) => (
					<path key={angle} d={BLUSH_PETAL} fill={`url(#${uid}-blush)`} transform={`rotate(${angle})`} />
				))}
			</g>
		</g>

		<g transform="translate(110 110)">
			<circle r="21" fill="#121618" stroke={`url(#${uid}-gold)`} strokeWidth="3" />
			<g className={'heart'}>
				<path d={HEART} fill={`url(#${uid}-rose)`} transform="scale(1.45)" />
			</g>
		</g>
	</svg>
);

const NavanoLogo = (props: NavanoLogoProps) => {
	const { variant = 'full', className = '', width, height } = props;
	// Gradient ids must be unique per instance; useId gives ":r1:", colons are not safe inside url(#…)
	const uid = `nv${useId().replace(/:/g, '')}`;

	if (variant === 'mark') {
		return (
			<svg
				className={`navano-logo ${className}`}
				width={width ?? 40}
				height={height ?? 40}
				viewBox="0 0 220 220"
				fill="none"
				role="img"
				aria-label="Navano"
			>
				<Crest uid={uid} size={220} />
			</svg>
		);
	}

	return (
		<svg
			className={`navano-logo ${className}`}
			width={width ?? 188}
			height={height ?? 52}
			viewBox="0 0 188 52"
			fill="none"
			role="img"
			aria-label="Navano"
		>
			<Crest uid={uid} size={48} x={0} y={2} />
			<text
				className={'wordmark'}
				x="60"
				y="30"
				fill={`url(#${uid}-word)`}
				fontFamily="'Cinzel', 'Playfair Display', serif"
				fontSize="22"
				fontWeight="700"
				letterSpacing="4"
				textLength="122"
				lengthAdjust="spacingAndGlyphs"
			>
				NAVANO
			</text>
			<defs>
				<linearGradient id={`${uid}-word`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#F2D8A7" />
					<stop offset="45%" stopColor="#C59341" />
					<stop offset="100%" stopColor="#E5BA73" />
				</linearGradient>
			</defs>
			<line x1="60" y1="36" x2="184" y2="36" stroke="#C59341" strokeOpacity="0.6" strokeWidth="0.75" />
			<text
				x="60"
				y="46"
				fill="currentColor"
				fontFamily="'Geist', 'Manrope', sans-serif"
				fontSize="6.4"
				fontWeight="600"
				letterSpacing="1.6"
				textLength="124"
				lengthAdjust="spacingAndGlyphs"
			>
				FLOWERS • CHOCOLATES • CAKES
			</text>
		</svg>
	);
};

export default NavanoLogo;
