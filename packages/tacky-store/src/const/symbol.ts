import { isSupportSymbol } from '../utils/lang';

export function compatibleSymbol(key) {
  return isSupportSymbol() ? Symbol(key) : `@@TACKY__${key}`;
}

export const CURRENT_MATERIAL_TYPE = compatibleSymbol('MaterialType');
export const NAMESPACE = compatibleSymbol('Namespace');
