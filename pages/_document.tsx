import { Html, Head, Main, NextScript } from 'next/document';

// Runs before first paint: saved choice, else the system setting (see libs/hooks/useThemeMode.ts)
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`;

// Link previews need absolute URLs: set REACT_APP_SITE_URL to the public domain
const SITE_URL = process.env.REACT_APP_SITE_URL ?? 'http://localhost:5072';
const SHARE_IMAGE = `${SITE_URL}/img/og/navano-share.jpg`;

const SITE_TITLE = 'Navano — Flowers, Chocolates & Cakes';
const SITE_DESCRIPTION =
	'Order flowers, chocolates and cakes from local stores anywhere in South Korea on Navano | ' +
	'Заказывайте цветы, шоколад и торты в местных магазинах по всей Южной Корее на Navano | ' +
	'Navano에서 대한민국 어디서나 동네 가게의 꽃, 초콜릿, 케이크를 주문하세요';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<meta name="robots" content="index,follow" />
				<meta name="theme-color" content="#e11d48" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keywords" content={'navano, flowers, chocolates, cakes, gift shop, korea'} />
				<meta name={'description'} content={SITE_DESCRIPTION} />

				{/* Link previews (Telegram, KakaoTalk, Facebook) */}
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Navano" />
				<meta property="og:title" content={SITE_TITLE} />
				<meta property="og:description" content={SITE_DESCRIPTION} />
				<meta property="og:url" content={SITE_URL} />
				<meta property="og:image" content={SHARE_IMAGE} />
				<meta property="og:image:type" content="image/jpeg" />
				<meta property="og:image:width" content="1024" />
				<meta property="og:image:height" content="1024" />
				<meta property="og:image:alt" content="A white basket of daisies tied with a white ribbon" />
				<meta property="og:locale" content="en_US" />
				<meta property="og:locale:alternate" content="ko_KR" />
				<meta property="og:locale:alternate" content="ru_RU" />

				{/* Square image → summary card */}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content={SITE_TITLE} />
				<meta name="twitter:description" content={SITE_DESCRIPTION} />
				<meta name="twitter:image" content={SHARE_IMAGE} />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
