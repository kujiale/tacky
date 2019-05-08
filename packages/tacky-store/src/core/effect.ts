import { ctx } from '../const/config'
import { store } from './store';
import { NAMESPACE, CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { bind } from '../utils/common';
import { Effect, MaterialType, TackyDescriptorValue, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';

function createEffect(target, name, original) {
  return async function (...payload: any[]) {
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Effect;
    await store.dispatch({
      name,
      payload,
      type: MaterialType.Effect,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Effect
    });
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
  };
}

export function effect(target: Object, name: string, descriptor: BabelDescriptor<Effect>): BabelDescriptor<TackyDescriptorValue> | undefined {
  invariant(
    ctx.middleware.effect,
    'If you want to use @effect decorator, please turn on the built-in effect middleware. By \"config(...)\".'
  );

  invariant(!!descriptor, 'The descriptor of the @effect handler have to exist.');

  // babel/typescript: @effect method() {}
  if (descriptor.value) {
    const original: Effect = descriptor.value;
    descriptor.value = createEffect(target, name, original);
    return descriptor;
  }
  // babel only: @effect method = () => {}
  const { initializer } = descriptor;
  descriptor.initializer = function () {
    invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please use babel compile it.');

    return createEffect(target, name, initializer && initializer.call(this));
  };

  return descriptor;
}
