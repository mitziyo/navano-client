import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme';

// pages/_document.tsx sets data-theme before first paint; this hook reads and changes it
const useThemeMode = () => {
	const [mode, setMode] = useState<ThemeMode>('light');

	useEffect(() => {
		const current = document.documentElement.getAttribute('data-theme');
		setMode(current === 'dark' ? 'dark' : 'light');
	}, []);

	const toggleMode = useCallback(() => {
		setMode((prev) => {
			const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
			document.documentElement.setAttribute('data-theme', next);
			try {
				localStorage.setItem(STORAGE_KEY, next);
			} catch (err) {
				// Storage can be blocked (private mode); the theme still switches for this page view
			}
			return next;
		});
	}, []);

	return { mode, toggleMode };
};

export default useThemeMode;
