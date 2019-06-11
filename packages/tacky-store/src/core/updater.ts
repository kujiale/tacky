import { store } from './store';
import { NAMESPACE, CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { bind } from '../utils/common';
import { Reducer, Mutation, MaterialType, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';

function createReducer(target, name, original) {
  return function (...payload: any[]) {
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Reducer;
    store.dispatch({
      name,
      payload,
      type: MaterialType.Reducer,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Reducer
    });
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
  }
}

/**
 * @reducer decorator, update state by reducer styling.
 */
export function reducer(...args: any[]) {
  const decorator = (target: Object, name: string, descriptor?: BabelDescriptor<any>): any => {
    // typescript only: @reducer method = () => {}
    if (!descriptor) {
      let reducerFunc;
      Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return reducerFunc;
        },
        set: function (original) {
          reducerFunc = createReducer(target, name, original);
        },
      });
      return;
    }

    // babel/typescript: @reducer method() {}
    if (descriptor.value) {
      const original: Reducer = descriptor.value;
      descriptor.value = createReducer(target, name, original);
      return descriptor;
    }

    // babel only: @reducer method = () => {}
    const { initializer } = descriptor
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please use babel compile it.');

      return createReducer(target, name, initializer && initializer.call(this));
    }

    return descriptor;
  };

  if (quacksLikeADecorator(args)) {
    // @decorator
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  return decorator;
}

function createMutation(target, name, original) {
  return function (...payload: any[]) {
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Mutation;
    store.dispatch({
      name,
      payload,
      type: MaterialType.Mutation,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Mutation
    });
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
  };
}

/**
 * @mutation decorator, update state by mutation styling.
 */
export function mutation(...args: any[]) {
  const decorator = (target: Object, name: string, descriptor?: BabelDescriptor<any>): any => {
    // typescript only: @mutation method = () => {}
    if (!descriptor) {
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
    if (descriptor.value) {
      const original: Mutation = descriptor.value;
      descriptor.value = createMutation(target, name, original);
      return descriptor;
    }

    // babel only: @mutation method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please use babel compile it.');

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
