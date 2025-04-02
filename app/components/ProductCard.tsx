import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2, CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

// Define our own product type that works with the Shopify Hydrogen components
type ProductCardFragment = {
  id: string;
  title: string;
  handle: string;
  images: {
    nodes: Array<{
      id?: string | null;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: CurrencyCode;
    };
  };
  variants?: {
    nodes: Array<{
      id: string;
      availableForSale: boolean;
      price: {
        amount: string;
        currencyCode: CurrencyCode;
      };
      compareAtPrice?: {
        amount: string;
        currencyCode: CurrencyCode;
      } | null;
    }>;
  };
};

export function ProductCard({
  product,
  loading,
}: {
  product: ProductCardFragment;
  loading?: 'eager' | 'lazy';
}) {
  const firstVariant = product.variants?.nodes[0];
  const isAvailable = firstVariant?.availableForSale || false;
  const isOnSale = firstVariant?.compareAtPrice?.amount
    ? parseFloat(firstVariant?.price?.amount) < parseFloat(firstVariant?.compareAtPrice?.amount)
    : false;

  return (
    <Link
      to={`/products/${product.handle}`}
      className="group flex h-full w-full flex-col"
      prefetch="intent"
    >
      <div className="relative flex-1 overflow-hidden">
        {product.images.nodes[0] && (
          <Image
            alt={product.images.nodes[0]?.altText || product.title}
            aspectRatio="1/1"
            data={product.images.nodes[0]}
            loading={loading}
            sizes="(min-width: 45em) 20vw, 50vw"
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
          />
        )}
        {!isAvailable && (
          <div className="absolute left-0 top-0 m-1 rounded-sm bg-neutral-900 px-2 py-1 text-xs font-medium text-white">
            Sold out
          </div>
        )}
        {isOnSale && (
          <div className="absolute left-0 top-0 m-1 rounded-sm bg-red-600 px-2 py-1 text-xs font-medium text-white">
            Sale
          </div>
        )}
      </div>
      <div className="mt-3 text-sm">
        <h3 className="truncate font-medium group-hover:underline">{product.title}</h3>
        <div className="mt-1 flex">
          <div className="flex gap-1">
            {isOnSale && firstVariant?.compareAtPrice && (
              <Money
                className="line-through opacity-50"
                data={firstVariant.compareAtPrice}
                withoutTrailingZeros
              />
            )}
            <Money 
              className={isOnSale ? "text-red-600 font-semibold" : ""} 
              data={firstVariant?.price || product.priceRange.minVariantPrice} 
              withoutTrailingZeros
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
