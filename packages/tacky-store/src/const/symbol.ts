import { isSupportSymbol } from '../utils/lang';

export function compatibleSymbol(key) {
  return isSupportSymbol() ? Symbol(key) : `@@TACKY__${key}`;
}

export const NAMESPACE = compatibleSymbol('namespace');
export const COMPONENT_INSTANCE_UID = compatibleSymbol('componentInstanceUid');
export const CURRENT_MATERIAL_TYPE = compatibleSymbol('materialType');
