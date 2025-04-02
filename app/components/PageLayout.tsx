import {Await, Link} from '@remix-run/react';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9]">
      <Aside.Provider>
        <CartAside cart={cart} />
        {header && (
          <Header
            header={header}
            cart={cart}
            publicStoreDomain={publicStoreDomain}
          />
        )}
        <main className="flex-grow pt-32">
          <div className="page-container px-4 py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <Footer
          footer={footer}
          header={header}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside.Provider>
    </div>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<div className="flex items-center justify-center h-32">Loading cart...</div>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}
