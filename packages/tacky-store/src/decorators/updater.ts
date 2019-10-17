import { store } from '../core/store';
import { NAMESPACE, CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { bind, convert2UniqueString } from '../utils/common';
import { Mutation, EMaterialType, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';

function createMutation(target: object, name: string | symbol | number, original: any) {
  const stringMethodName = convert2UniqueString(name);
  return function (...payload: any[]) {
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.MUTATION;
    store.dispatch({
      name: stringMethodName,
      payload,
      type: EMaterialType.MUTATION,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Mutation
    });
    /**
     * @todo: 如果从 effect 进来，设置成 effect，否则设置成 default
     */
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
  };
}

/**
 * @mutation decorator, update state by mutation styling.
 */
export function mutation(...args: any[]) {
  const decorator = (target: object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any => {
    // typescript only: @mutation method = () => {}
    if (descriptor === void 0) {
      let mutationFunc;
      Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return mutationFunc;
        },
        set: function (original) {
          mutationFunc = createMutation(target, name, original);
        },
      });
      return;
    }

    // babel/typescript: @mutation method() {}
    if (descriptor.value !== void 0) {
      const original: Mutation = descriptor.value;
      descriptor.value = createMutation(target, name, original);
      return descriptor;
    }

    // babel only: @mutation method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

      return createMutation(target, name, initializer && initializer.call(this));
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
