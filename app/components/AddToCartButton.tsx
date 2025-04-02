import {type FetcherWithComponents} from '@remix-run/react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

function SubmitButton({
  children,
  disabled,
  fetcher,
  className = '',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  fetcher: FetcherWithComponents<any>;
  className?: string;
}) {
  const buttonClasses = `relative flex w-full items-center justify-center tracking-wide ${className}`;
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

  if (disabled) {
    return (
      <button disabled className={`${buttonClasses} ${disabledClasses}`}>
        {children || 'Out Of Stock'}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={fetcher.state !== 'idle'}
      className={`${buttonClasses} ${fetcher.state !== 'idle' ? disabledClasses : 'hover:opacity-90'}`}
    >
      <div className="absolute left-0 ml-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      {children || 'Add To Cart'}
    </button>
  );
}

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className = 'border border-black bg-white p-4 text-black',
}: {
  analytics?: unknown;
  children?: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <SubmitButton disabled={disabled} fetcher={fetcher} className={className}>
            {children}
          </SubmitButton>
          {onClick && (
            <button
              className="hidden"
              formNoValidate
              onClick={() => {
                onClick();
              }}
            />
          )}
        </>
      )}
    </CartForm>
  );
}
