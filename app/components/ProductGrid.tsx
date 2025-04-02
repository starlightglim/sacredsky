import {Suspense} from 'react';
import {motion} from 'framer-motion';
import {ProductCard} from './ProductCard';

export function ProductGrid({
  products,
  className,
  containerClassName,
}: {
  products: Array<any>;
  className?: string;
  containerClassName?: string;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Suspense>
      <div className={`${containerClassName}`}>
        <motion.div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </Suspense>
  );
} 