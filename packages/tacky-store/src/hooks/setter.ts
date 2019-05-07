import { CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { MaterialType } from '../interfaces';
import { invariant } from '../utils/error';

export function setterBeforeHook({ target }) {
  invariant(
    target[CURRENT_MATERIAL_TYPE] === MaterialType.Mutation,
    'You cannot assign value to state by \'this.\' directly. Please use mutation to update state.'
  );
}

export function setterAfterHook() {
}
