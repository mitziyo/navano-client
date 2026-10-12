import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Quiet scroll reveal for homepage sections; renders children as-is when reduced motion is on
const Reveal = ({ children }: { children: ReactNode }) => {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) return <>{children}</>;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
		>
			{children}
		</motion.div>
	);
};

export default Reveal;
