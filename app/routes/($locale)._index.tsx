import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, useNavigate, type MetaFunction} from '@remix-run/react';
import {Suspense, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductCard} from '~/components/ProductCard';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {ProductImage} from '~/components/ProductImage';
import {useAside} from '~/components/Aside';
import {AddToCartButton} from '~/components/AddToCartButton';
import type {
  FeaturedCollectionFragment,
  ProductFragment,
} from 'storefrontapi.generated';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  
  const [{collections}, {products}] = await Promise.all([
    storefront.query(FEATURED_COLLECTION_QUERY),
    storefront.query(FEATURED_PRODUCT_QUERY, {
      variables: {selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
    featuredProduct: products.nodes[0] || null, // Get the first product
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto">
      <FeaturedProduct product={data.featuredProduct} />
    </div>
  );
}

function FeaturedProduct({
  product,
}: {
  product: ProductFragment | null;
}) {
  if (!product) return null;
  
  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  // Get all product images 
  // Use any type for now since TypeScript doesn't know about the images field yet
  const productAny = product as any;
  const productImages = productAny.images?.nodes || [];
  
  // Create an array to hold all images
  const allImages: any[] = [];
  
  // Add all product images first
  if (Array.isArray(productImages) && productImages.length > 0) {
    allImages.push(...productImages);
  }
  // If no product images, try to get from selected variant
  else if (selectedVariant?.image) {
    allImages.push(selectedVariant.image);
  }

  const {title, descriptionHtml, description} = product;
  const descriptionParagraphs = description?.split('\n\n') || [];
  const navigate = useNavigate();
  const {open} = useAside();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const firstImageRef = useRef(null);
  const isFirstImageInView = useInView(firstImageRef, { once: true });

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 pt-6 pb-24 mt-0 min-h-[calc(100vh-120px)]"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="grid grid-cols-12 gap-4 md:gap-8">
        {/* Left Column - Description and Title - Full width on mobile, side column on desktop */}
        <motion.div 
          className="col-span-12 order-2 md:order-1 md:col-span-2 lg:col-span-2 mb-8 md:mb-0"
          variants={itemVariants}
        >
          <div className="md:sticky md:top-36 space-y-6">
            <motion.h1 
              className="text-xl text-gray-800"
              variants={itemVariants}
            >
              {title}
            </motion.h1>

            <motion.div 
              className="space-y-4 text-sm text-gray-600 max-h-[40vh] md:max-h-[60vh] overflow-y-auto pr-2 mt-4 md:mt-8 hide-scrollbar"
              variants={itemVariants}
            >
              {descriptionParagraphs.map((paragraph, index) => (
                <motion.p 
                  key={index}
                  variants={itemVariants}
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Middle Column - Product Images - Full width on mobile */}
        <motion.div 
          className="col-span-12 order-1 md:order-2 md:col-span-8 lg:col-span-8 flex flex-col space-y-6 mb-8 md:mb-0"
          variants={itemVariants}
        >
          {allImages.map((image, index) => {
            // If it's the first image, we want to center it and make it larger
            if (index === 0) {
              return (
                <motion.div 
                  key={image.id || index} 
                  className="h-[50vh] md:h-[85vh] rounded-xl overflow-hidden flex items-center justify-center"
                  ref={firstImageRef}
                  variants={imageVariants}
                  initial="hidden"
                  animate={isFirstImageInView ? "visible" : "hidden"}
                  custom={index}
                >
                  <Image
                    data={image}
                    sizes="(min-width: 768px) 66vw, 100vw"
                    className="w-full h-full object-contain"
                    alt={image.altText || `Product image ${index + 1}`}
                  />
                </motion.div>
              );
            }
            
            // For other images, add scroll-triggered animations
            const imageRef = useRef(null);
            const isInView = useInView(imageRef, { once: true, amount: 0.3 });
            
            return (
              <motion.div 
                key={image.id || index} 
                className="h-[50vh] md:h-[75vh] rounded-xl overflow-hidden"
                ref={imageRef}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <Image
                  data={image}
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="w-full h-full object-contain"
                  alt={image.altText || `Product image ${index + 1}`}
                />
              </motion.div>
            );
          })}
          
          {/* If no images are available, show a placeholder */}
          {allImages.length === 0 && (
            <motion.div 
              className="h-[50vh] md:h-[75vh] rounded-xl flex items-center justify-center bg-gray-100"
              variants={itemVariants}
            >
              <p className="text-gray-400">No product images available</p>
            </motion.div>
          )}
        </motion.div>

        {/* Right Column - Options, Price and Add to Cart - Full width on mobile */}
        <motion.div 
          className="col-span-12 order-3 md:col-span-2 lg:col-span-2"
          variants={itemVariants}
        >
          {/* Options and pricing in sticky container */}
          <div className="md:sticky md:top-36 md:flex md:flex-col md:h-[calc(100vh-180px)]">
            {/* Options section - scrollable if needed */}
            <motion.div 
              className="overflow-y-auto hide-scrollbar flex-grow pb-4"
              variants={itemVariants}
            >
              {/* Selected Options Display */}
              {selectedVariant?.selectedOptions?.length > 0 && (
                <motion.div 
                  className="flex flex-col gap-2 mb-4"
                  variants={itemVariants}
                >
                  {selectedVariant.selectedOptions
                    .filter(option => option.value.toLowerCase() !== 'default title')
                    .map(option => (
                      <motion.div 
                        key={option.name} 
                        className="flex items-center gap-2"
                        variants={itemVariants}
                      >
                        <span className="text-gray-800">{option.value}</span>
                      </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Color/variant selection */}
              {productOptions.map((option) => {
                // If there is only a single value in the option values, don't display the option
                if (option.optionValues.length === 1) return null;

                return (
                  <motion.div 
                    key={option.name} 
                    className="space-y-2 mb-4"
                    variants={itemVariants}
                  >
                    <motion.div 
                      className="flex gap-2 flex-wrap"
                      variants={itemVariants}
                    >
                      {option.optionValues.map((value) => {
                        const {
                          name,
                          handle,
                          variantUriQuery,
                          selected,
                          available,
                          exists,
                          isDifferentProduct,
                          swatch,
                        } = value;
                        
                        if (isDifferentProduct) {
                          return (
                            <motion.div
                              key={option.name + name}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Link
                                className={`w-6 h-6 rounded-full block ${selected ? 'ring-2 ring-gray-400' : ''}`}
                                prefetch="intent"
                                preventScrollReset
                                replace
                                to={`/products/${handle}?${variantUriQuery}`}
                                style={swatch?.color ? { backgroundColor: swatch.color } : undefined}
                              />
                            </motion.div>
                          );
                        } else {
                          return (
                            <motion.button
                              type="button"
                              className={`w-6 h-6 rounded-full ${selected ? 'ring-2 ring-gray-400' : ''} ${
                                available ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                              }`}
                              key={option.name + name}
                              disabled={!exists || !available}
                              onClick={() => {
                                if (!selected && exists) {
                                  navigate(`?${variantUriQuery}`, {
                                    replace: true,
                                    preventScrollReset: true,
                                  });
                                }
                              }}
                              style={swatch?.color ? { backgroundColor: swatch.color } : undefined}
                              whileHover={available ? { scale: 1.1 } : {}}
                              whileTap={available ? { scale: 0.95 } : {}}
                              variants={itemVariants}
                            />
                          );
                        }
                      })}
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
            
            {/* Price and Add to Cart - positioned at bottom */}
            <motion.div 
              className="mt-auto pt-6 border-t border-gray-100"
              variants={itemVariants}
            >
              <motion.div 
                className="space-y-2 mb-4"
                variants={itemVariants}
              >
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                  className="text-2xl"
                />
                <motion.p 
                  className="text-gray-400 text-xs"
                  variants={itemVariants}
                >
                  Free shipping
                </motion.p>
              </motion.div>

              {/* Add to cart button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
              >
                <AddToCartButton
                  disabled={!selectedVariant || !selectedVariant.availableForSale}
                  onClick={() => {
                    open('cart');
                  }}
                  lines={
                    selectedVariant
                      ? [
                          {
                            merchandiseId: selectedVariant.id,
                            quantity: 1,
                            selectedVariant,
                          },
                        ]
                      : []
                  }
                  className="py-3 px-4 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors w-full text-sm"
                >
                  {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
                </AddToCartButton>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </motion.div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const FEATURED_PRODUCT_QUERY = `#graphql
  query FeaturedProduct(
    $country: CountryCode
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    products(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...Product
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
