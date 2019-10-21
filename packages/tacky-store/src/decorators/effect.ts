import { ctx } from '../const/config'
import { store } from '../core/store';
import { NAMESPACE, CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { bind } from '../utils/common';
import { Effect, EMaterialType, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';

function createEffect(target, name, original) {
  return async function (...payload: any[]) {
    target[CURRENT_MATERIAL_TYPE] = EMaterialType.EFFECT;
    await store.dispatch({
      name,
      payload,
      type: EMaterialType.EFFECT,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Effect
    });
    target[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
  };
}

/**
 * @effect decorator, handle some async process.
 */
export function effect(...args: any[]) {
  const decorator = (target: Object, name: string | symbol, descriptor?: BabelDescriptor<any>): any => {
    invariant(
      ctx.middleware.effect,
      'If you want to use @effect decorator, please turn on the built-in effect middleware. By \"config(...)\".'
    );

    // typescript only: @effect method = async () => {}
    if (descriptor === void 0) {
      let effectFunc;
      Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return effectFunc;
        },
        set: function (original) {
          effectFunc = createEffect(target, name, original);
        },
      });
      return;
    }

    // babel/typescript: @effect method() {}
    if (descriptor.value !== void 0) {
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

  if (quacksLikeADecorator(args)) {
    // @decorator
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  return decorator;
}
