import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  image,
  className,
}: {
  image: ProductVariantFragment['image'];
  className?: string;
}) {
  if (!image) {
    return <div className={`product-image ${className || ''}`} />;
  }
  return (
    <div className={`product-image ${className || ''}`}>
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </div>
  );
}
