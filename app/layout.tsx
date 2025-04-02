import {useNonce, Analytics} from '@shopify/hydrogen';
import {
  Links,
  Meta,
  Scripts,
  useRouteLoaderData,
  ScrollRestoration,
  Outlet,
} from '@remix-run/react';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from '~/components/PageLayout';
import {RootLoader} from './root';

export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>mousepadv1</title>
        <link rel="stylesheet" href={tailwindCss} />
        <link rel="stylesheet" href={resetStyles} />
        <link rel="stylesheet" href={appStyles} />
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        <link rel="icon" href="/pngsacredsky.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/pngsacredsky.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/pngsacredsky.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#fafaf9] text-black selection:bg-teal-300 white:bg-neutral-900 white:text-white white:selection:bg-pink-500 white:selection:text-white">
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout {...data}>
              <Outlet />
            </PageLayout>
          </Analytics.Provider>
        ) : (
          <Outlet />
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
