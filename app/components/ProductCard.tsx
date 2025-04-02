import {Image, Link, Money} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductCard({
  product,
}: {
  product: ProductFragment;
}) {
  const firstVariant = product.variants?.nodes[0];
  const isDiscounted = firstVariant?.compareAtPrice?.amount && firstVariant?.price?.amount 
    ? parseFloat(firstVariant.price.amount) < parseFloat(firstVariant.compareAtPrice.amount)
    : false;

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Link to={`/products/${product.handle}`}>
        <div className="card-image bg-white aspect-[4/5] mb-4 rounded-lg overflow-hidden">
          {product.featuredImage && (
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="4/5"
              data={product.featuredImage}
              loading="lazy"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover w-full h-full transition-all duration-500"
            />
          )}
        </div>

        <div className="flex flex-col gap-1 p-1">
          <h3 className="text-sm md:text-base text-gray-900 truncate">
            {product.title}
          </h3>
          <div className="flex gap-2">
            <span className="text-sm md:text-base text-gray-800 font-medium">
              <Money data={firstVariant?.price} />
            </span>
            {isDiscounted && firstVariant?.compareAtPrice && (
              <span className="text-sm md:text-base text-gray-500 line-through">
                <Money data={firstVariant.compareAtPrice} />
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
