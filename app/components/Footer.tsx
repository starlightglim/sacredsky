import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({header}: FooterProps) {
  const {shop, menu} = header;

  return (
    <footer className="footer text-white text-center py-6 mt-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} {shop.name}</p>
          <FooterMenu
            menu={menu}
            primaryDomainUrl={shop.primaryDomain.url}
            publicStoreDomain={shop.primaryDomain.url}
          />
        </div>
      </div>
    </footer>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="flex flex-wrap justify-center gap-4 text-xs" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items
        .filter(item => !item.title.toLowerCase().includes('search') && 
                       !item.title.toLowerCase().includes('recherche') &&
                       !item.title.toLowerCase().includes('catalogue') &&
                       !item.title.toLowerCase().includes('catalog') &&
                       !item.title.toLowerCase().includes('contact'))
        .map((item) => {
          if (!item.url) return null;
          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          return isExternal ? (
            <a href={url} key={item.id} rel="noopener noreferrer" target="_blank" className="text-gray-300 hover:text-white">
              {item.title}
            </a>
          ) : (
            <NavLink
              end
              key={item.id}
              prefetch="intent"
              style={activeLinkStyle}
              to={url}
              className="text-gray-300 hover:text-white"
            >
              {item.title}
            </NavLink>
          );
        })}
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'footer',
  items: [
    {
      id: 'privacy',
      title: 'Privacy',
      url: '/policies/privacy-policy',
    },
    {
      id: 'shipping',
      title: 'Shipping',
      url: '/policies/shipping',
    },
    {
      id: 'terms',
      title: 'Terms',
      url: '/policies/terms-of-service',
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
