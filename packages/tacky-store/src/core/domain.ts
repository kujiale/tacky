import { CURRENT_MATERIAL_TYPE, NAMESPACE } from '../const/symbol';
import { MaterialType, Mutation, AtomStateTree } from '../interfaces';
import Observable from './observable';
import { observeObject } from '../utils/observe-object';
import { isObject, bind } from '../utils/common';
import { invariant } from '../utils/error';
import { store } from './store';
import StateTree from './stateTree';

let uid = 0;
export const observableStateTree = new WeakMap();

export function createObservableState({
  raw,
  target,
  currentInstance,
}) {
  if (isObject(raw)) {
    observeObject({
      raw,
      target,
      currentInstance,
    });
  }

  return new Observable(raw, target, currentInstance);
}

export function observableStateFactory({
  currentInstance,
  target,
  property,
  raw,
}) {
  if (observableStateTree.get(currentInstance)) {
    if (observableStateTree.get(currentInstance)[property]) {
      return observableStateTree.get(currentInstance)[property];
    }
    const observable = createObservableState({ raw, target, currentInstance });
    observableStateTree.get(currentInstance)[property] = observable;

    return observableStateTree.get(currentInstance)[property];
  }
  observableStateTree.set(currentInstance, {});
  const observable = createObservableState({ raw, target, currentInstance });
  observableStateTree.get(currentInstance)[property] = observable;

  return observableStateTree.get(currentInstance)[property];
}

export class Domain {
  constructor() {
    const target = Object.getPrototypeOf(this);
    uid += 1;
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Mutation;
    const domainName = target.constructor.name || 'TACKY_DOMAIN';
    const namespace = `${domainName}@@${uid}`;
    this[NAMESPACE] = namespace;
    StateTree.initInstanceStateTree(namespace, this);
  }

  $lazyLoad() {
    const target = Object.getPrototypeOf(this);
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
    StateTree.initPlainObjectAndDefaultStateTreeFromInstance(this[NAMESPACE]);
  }

  $reset() {
    const atom = StateTree.globalStateTree[this[NAMESPACE]] as AtomStateTree;
    this.dispatch(atom.default);
  }

  $destroy() {
    StateTree.clearAll(this[NAMESPACE]);
  }

  $update(obj: object) {
    invariant(isObject(obj), 'resetState(...) param type error. Param should be a plain object.');
    this.dispatch(obj);
  }

  private dispatch(obj) {
    const target = Object.getPrototypeOf(this);
    const original = function () {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          this[key] = obj[key];
        }
      }
    };
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Mutation;
    // update state before render
    if (!store) {
      original.call(this);
      StateTree.syncPlainObjectStateTreeFromInstance(this[NAMESPACE]);
      target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
      return;
    }
    // update state after render
    store.dispatch({
      payload: [],
      type: MaterialType.Mutation,
      namespace: this[NAMESPACE],
      original: bind(original, this) as Mutation
    });
    target[CURRENT_MATERIAL_TYPE] = MaterialType.Noop;
  }
}
