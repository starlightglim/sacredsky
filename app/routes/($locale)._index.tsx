import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, useNavigate, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 mt-0 min-h-[calc(100vh-120px)]">
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Description and Title (Sticky) */}
        <div className="col-span-12 md:col-span-2 lg:col-span-2">
          <div className="sticky top-36 space-y-6">
            <h1 className="text-xl text-gray-800">
              {title}
            </h1>

            <div className="space-y-4 text-sm text-gray-600 max-h-[60vh] overflow-y-auto pr-2 mt-8">
              {descriptionParagraphs.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Product Images (Scrollable) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-8 flex flex-col space-y-6">
          {allImages.map((image, index) => (
            <div key={image.id || index} className="h-[75vh] rounded-xl overflow-hidden">
              <Image
                data={image}
                sizes="(min-width: 768px) 66vw, 100vw"
                className="w-full h-full object-contain"
                alt={image.altText || `Product image ${index + 1}`}
              />
            </div>
          ))}
          {/* If no images are available, show a placeholder */}
          {allImages.length === 0 && (
            <div className="h-[75vh] rounded-xl flex items-center justify-center bg-gray-100">
              <p className="text-gray-400">No product images available</p>
            </div>
          )}
        </div>

        {/* Right Column - Options, Price and Add to Cart (Sticky) */}
        <div className="col-span-12 md:col-span-2 lg:col-span-2">
          {/* Options and pricing in sticky container */}
          <div className="sticky top-36 flex flex-col h-[calc(100vh-180px)]">
            {/* Options section - scrollable if needed */}
            <div className="overflow-y-auto flex-grow pb-4">
              {/* Selected Options Display */}
              {selectedVariant?.selectedOptions?.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {selectedVariant.selectedOptions
                    .filter(option => option.value.toLowerCase() !== 'default title')
                    .map(option => (
                      <div key={option.name} className="flex items-center gap-2">
                        <span className="text-gray-800">{option.value}</span>
                      </div>
                  ))}
                </div>
              )}

              {/* Color/variant selection */}
              {productOptions.map((option) => {
                // If there is only a single value in the option values, don't display the option
                if (option.optionValues.length === 1) return null;

                return (
                  <div key={option.name} className="space-y-2 mb-4">
                    <div className="flex gap-2 flex-wrap">
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
                            <Link
                              className={`w-6 h-6 rounded-full ${selected ? 'ring-2 ring-gray-400' : ''}`}
                              key={option.name + name}
                              prefetch="intent"
                              preventScrollReset
                              replace
                              to={`/products/${handle}?${variantUriQuery}`}
                              style={swatch?.color ? { backgroundColor: swatch.color } : undefined}
                            />
                          );
                        } else {
                          return (
                            <button
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
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Price and Add to Cart - positioned at bottom */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="space-y-2 mb-4">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                  className="text-2xl"
                />
                <p className="text-gray-400 text-xs">Free shipping</p>
              </div>

              {/* Add to cart button */}
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
            </div>
          </div>
        </div>
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
    </div>
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
