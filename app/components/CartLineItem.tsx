import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="flex py-8 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0">
        {image && (
          <Link
            prefetch="intent"
            to="/"
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
            className="block overflow-hidden rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={100}
              width={100}
              className="h-[100px] w-[100px] object-cover object-center"
            />
          </Link>
        )}
      </div>

      <div className="ml-5 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between">
            <div>
              <Link
                prefetch="intent"
                to="/"
                onClick={() => {
                  if (layout === 'aside') {
                    close();
                  }
                }}
                className="font-medium text-gray-900 hover:text-gray-700 transition-colors line-clamp-2"
              >
                {product.title}
              </Link>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedOptions
                  .filter(option => option.value.toLowerCase() !== 'default title' && option.name.toLowerCase() !== 'title')
                  .map((option) => (
                    <p key={option.name} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {option.value}
                    </p>
                ))}
              </div>
            </div>
            <div className="ml-4">
              <ProductPrice price={line?.cost?.totalAmount} className="font-semibold text-lg" />
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-1 items-end justify-between">
          <CartLineQuantity line={line} />
        </div>
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shadow-sm">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="w-9 h-9 flex items-center justify-center text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">&#8722;</span>
          </button>
        </CartLineUpdateButton>
        
        <span className="px-4 text-gray-900 font-medium">{quantity}</span>
        
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="w-9 h-9 flex items-center justify-center text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">&#43;</span>
          </button>
        </CartLineUpdateButton>
      </div>
      
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button 
        disabled={disabled} 
        type="submit"
        className="text-sm font-medium text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}
