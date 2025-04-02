import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from '~/components/CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const cartHasItems = cart?.totalQuantity && cart?.totalQuantity > 0;

  return (
    <div className="h-full flex flex-col">
      <CartEmpty hidden={linesCount} layout={layout} />
      {cartHasItems && (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-6">
            <ul className="divide-y divide-gray-100">
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          <CartSummary cart={cart} layout={layout} />
        </div>
      )}
    </div>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="flex h-full flex-col items-center justify-center space-y-8 px-4 py-24 text-center">
      <div className="text-5xl">🛒</div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 max-w-md">
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you started!
        </p>
      </div>
      <Link 
        to="/collections" 
        onClick={close} 
        prefetch="viewport" 
        className="inline-block rounded-full bg-black px-8 py-4 text-center text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  );
}
