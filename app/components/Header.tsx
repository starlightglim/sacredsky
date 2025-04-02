import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {AnimatedText} from '~/components/AnimatedText';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CartBadge } from '~/components/CartBadge';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  // Transform values based on scroll position
  const opacity = useTransform(scrollY, [0, 100], [0, 0.15]);
  const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
  
  // Listen to scroll position
  useEffect(() => {
    const unsubscribe = scrollY.onChange(latest => {
      setScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);
  
  return (
    <motion.nav 
      className="flex flex-col items-center justify-between p-4 lg:px-6 fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring", damping: 20 }}
    >
      <motion.div 
        className="absolute inset-0 bg-transparent"
        style={{ opacity }}
      />
      <div className="flex w-full items-center justify-between relative z-10">
        {/* Left empty section for balance - hidden on small screens */}
        <div className="w-1/12 md:w-1/3"></div>
        
        {/* Center logo - larger proportion on small screens */}
        <motion.div 
          className="flex justify-center w-10/12 md:w-1/3"
          style={{ scale }}
          initial={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <NavLink prefetch="intent" to="/" className="flex items-center justify-center">
            <motion.img 
              src="/pngsacredsky.png" 
              alt={shop.name} 
              className="h-16 md:h-24 w-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.4
              }}
              whileHover={{ y: -5 }}
            />
          </NavLink>
        </motion.div>
        
        {/* Right section with cart only - smaller on mobile */}
        <div className="flex justify-end w-1/12 md:w-1/3">
          <CartToggle cart={cart} />
        </div>
      </div>
    </motion.nav>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  // Keep the function but don't render menu items
  return null;
}

function HeaderCtas({
  cart,
}: Pick<HeaderProps, 'cart'>) {
  return (
    <div className="flex items-center">
      <CartToggle cart={cart} />
    </div>
  );
}

function HeaderMenuMobileToggle() {
  // No longer needed since we're removing the mobile menu
  return null;
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'var(--color-gray-400)' : 'inherit',
  };
}
