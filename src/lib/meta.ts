import { useFetch } from './api';
import type { Meta } from '../types';

export function useMeta() {
  const { data, loading, reload, error } = useFetch<Meta>('/api/meta');
  return { meta: data, metaLoading: loading, reloadMeta: reload, metaError: error };
}
