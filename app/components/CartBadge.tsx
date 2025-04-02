import { useAside } from '~/components/Aside';
import { useAnalytics } from '@shopify/hydrogen';
import type { CartViewPayload } from '@shopify/hydrogen';
import { motion } from 'framer-motion';

export function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="text-black/60 px-2 py-1 md:px-4 md:py-2 relative flex items-center cursor-pointer bg-transparent hover:bg-white/20 rounded-full transition-colors duration-150"
      onClick={() => {
        open('cart');
        
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="md:w-6 md:h-6">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      {count !== null && count > 0 && (
        <motion.span 
          className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-black/70"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {count}
        </motion.span>
      )}
    </button>
  );
} 