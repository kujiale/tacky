import { isSupportSymbol } from '../utils/lang';

export function compatibleSymbol(key: string) {
  return isSupportSymbol() ? Symbol(key) : `@@TACKY__${key}`;
}

export const CURRENT_MATERIAL_TYPE = compatibleSymbol('material-type');
export const NAMESPACE = compatibleSymbol('namespace');
