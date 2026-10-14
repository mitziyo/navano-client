module.exports = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'kr', 'ru'],
		localeDetection: false,
	},
	trailingSlash: true,
	// Dev only: re-read public/locales on each render so new keys show up without restarting `yarn dev`
	reloadOnPrerender: process.env.NODE_ENV === 'development',
};
