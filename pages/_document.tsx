import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
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
