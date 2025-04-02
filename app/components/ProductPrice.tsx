import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
  className,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
}) {
  return (
    <div className={`product-price ${className || ''}`}>
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          {price ? <Money data={price} className="text-red-600" /> : null}
          <s className="opacity-50 ml-2">
            <Money data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
