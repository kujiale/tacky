import { store } from './store';
import { NAMESPACE, CURRENT_MATERIAL_TYPE } from '../const/symbol';
import { bind } from '../utils/common';
import { Reducer, Mutation, MaterialType, StickyDescriptorValue, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';

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

export function reducer(target: Object, name: string, descriptor: BabelDescriptor<any>): BabelDescriptor<any> | undefined {
  invariant(!!descriptor, 'The descriptor of the @reducer handler have to exist.');

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

export function mutation(target: Object, name: string, descriptor: BabelDescriptor<any>): BabelDescriptor<any> | undefined {
  invariant(!!descriptor, 'The descriptor of the @mutation handler have to exist.');

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
