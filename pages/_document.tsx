import { Html, Head, Main, NextScript } from 'next/document';

// Runs before first paint: saved choice, else the system setting (see libs/hooks/useThemeMode.ts)
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'navano, flowers, chocolates, cakes, gift shop, korea'} />
				<meta
					name={'description'}
					content={
						'Order flowers, chocolates and cakes from local stores anywhere in South Korea on Navano | ' +
						'Заказывайте цветы, шоколад и торты в местных магазинах по всей Южной Корее на Navano | ' +
						'Navano에서 대한민국 어디서나 동네 가게의 꽃, 초콜릿, 케이크를 주문하세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
