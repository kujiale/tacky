import { ctx } from '../const/config';
import { store } from '../core/store';
import { CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { bind, convert2UniqueString } from '../utils/common';
import { Effect, EMaterialType, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';

/**
 * @todo: enhance effect feature, such as takeLead, takeLast
 */
function createEffect(target: Object, name: string | symbol | number, original: any) {
  const stringMethodName = convert2UniqueString(name);
  return function (...payload: any[]) {
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.EFFECT;
    store.dispatch({
      name: stringMethodName,
      payload,
      type: EMaterialType.EFFECT,
      domain: this,
      original: bind(original, this) as Effect
    });
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
  };
}

/**
 * decorator @effect, handle some async process and effect.
 */
export function effect(...args: any[]) {
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any => {
    invariant(
      ctx.middleware.effect,
      'If you want to use @effect decorator, please turn on the built-in effect middleware. By \"config(...)\".'
    );

    // typescript only: @effect method = async () => {}
    if (descriptor === void 0) {
      let effectFunc: Function;
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
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

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
