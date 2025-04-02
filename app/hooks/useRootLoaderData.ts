import {useMatches} from '@remix-run/react';
import {type RootLoader} from '~/root';

/**
 * Utility function to access the root loader data from any component
 */
export function useRootLoaderData() {
  const [root] = useMatches();
  return root?.data as ReturnType<RootLoader>;
} 