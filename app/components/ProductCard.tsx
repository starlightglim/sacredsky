import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2, CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import { motion } from 'framer-motion';

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
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        to={`/products/${product.handle}`}
        className="group flex h-full w-full flex-col"
        prefetch="intent"
      >
        <motion.div className="relative flex-1 overflow-hidden rounded-lg">
          {product.images.nodes[0] && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                alt={product.images.nodes[0]?.altText || product.title}
                aspectRatio="1/1"
                data={product.images.nodes[0]}
                loading={loading}
                sizes="(min-width: 45em) 20vw, 50vw"
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}
          {!isAvailable && (
            <motion.div 
              className="absolute left-0 top-0 m-1 rounded-sm bg-neutral-900 px-2 py-1 text-xs font-medium text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              Sold out
            </motion.div>
          )}
          {isOnSale && (
            <motion.div 
              className="absolute left-0 top-0 m-1 rounded-sm bg-red-600 px-2 py-1 text-xs font-medium text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              Sale
            </motion.div>
          )}
        </motion.div>
        <motion.div 
          className="mt-3 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h3 
            className="truncate font-medium group-hover:underline"
            whileHover={{ x: 2 }}
          >
            {product.title}
          </motion.h3>
          <motion.div 
            className="mt-1 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
