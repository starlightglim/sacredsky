import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' 
      ? 'bg-gray-50 p-8 rounded-2xl shadow-sm' 
      : 'border-t border-gray-200 p-6 sticky bottom-0 bg-white shadow-md';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4 className="text-xl font-medium text-gray-900 mb-6">Order summary</h4>
      <div className="space-y-6">
        <dl className="flex items-center justify-between">
          <dt className="text-sm text-gray-600">Subtotal</dt>
          <dd className="text-base font-medium text-gray-900">
            {cart.cost?.subtotalAmount?.amount ? (
              <Money data={cart.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </dd>
        </dl>
        <div className="border-t border-gray-200 pt-6">
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </div>
      </div>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className="mt-6">
      <a 
        href={checkoutUrl} 
        target="_self"
        className="w-full rounded-full border border-transparent bg-black px-6 py-4 text-center text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors flex items-center justify-center"
      >
        Checkout
      </a>
    </div>
  );
}
