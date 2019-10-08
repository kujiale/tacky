import { Store, DispatchedAction, Reducer, Mutation, MaterialType, AtomStateTree } from '../interfaces';
import { invariant } from '../utils/error';
import collector from './collector';
import differ from './differ';
import { shallowEqual } from '../utils/common';
import DomainStore from './domain-store';

export let store: Store;

export function createStore(enhancer: (createStore: any) => Store) {
  if (enhancer) {
    store = enhancer(createStore);
    return store;
  }

  const componentUUIDToListeners = {};
  let isUpdating: boolean = false;

  function getState(namespace?: string) {
    invariant(!isUpdating, 'You may not call store.getState() while the mutation/reducer is executing.');

    if (namespace) {
      const atom = DomainStore.globalStateTree[namespace] as AtomStateTree;
      return atom.plainObject;
    }

    return DomainStore.globalStateTree;
  }

  function subscribe(listener: Function, uuid: string) {
    let isSubscribed = true;

    if (!componentUUIDToListeners[uuid]) {
      componentUUIDToListeners[uuid] = [];
    }

    componentUUIDToListeners[uuid].push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      const index = componentUUIDToListeners[uuid].indexOf(listener);
      componentUUIDToListeners[uuid].splice(index, 1);
    }
  }

  function dispatch(action: DispatchedAction) {
    const {
      // name,
      payload,
      type,
      namespace,
      original,
    } = action;
    let isDifferent = false;

    invariant(!isUpdating, 'Cannot trigger other mutation/reducer while the mutation/reducer is executing.');

    try {
      isUpdating = true;
      // reducer
      if (type === MaterialType.Reducer) {
        const prevSnapshot = deepMerge({}, StateTree.globalStateTree[namespace].plainObject, { clone: true });
        const currentReducer = original as Reducer;
        const nextSnapshot = currentReducer(prevSnapshot, ...payload);
        StateTree.syncPlainObjectAndInstanceStateTree(namespace, nextSnapshot);
        isDifferent = !shallowEqual(prevSnapshot, nextSnapshot);
      }
      // mutation
      if (type === MaterialType.Mutation) {
        differ.start();
        const currentMutation = original as Mutation;
        currentMutation(...payload);
        isDifferent = differ.differFlag;
        differ.end();
        if (isDifferent) {
          StateTree.syncPlainObjectStateTreeFromInstance(namespace);
        }
      }
    } finally {
      isUpdating = false;
    }

    if (!isDifferent) {
      return action;
    }

    const componentInstanceIds: string[] = collector.dependencyMap[namespace] || [];
    let tempListeners: Function[] = [];

    for (let index = 0; index < componentInstanceIds.length; index++) {
      const cid = componentInstanceIds[index];
      const listeners = componentUUIDToListeners[cid] || [];
      tempListeners = tempListeners.concat(listeners);
    }

    for (let index = 0; index < tempListeners.length; index++) {
      const listener = tempListeners[index];
      listener();
    }

    return action;
  }

  return {
    dispatch,
    subscribe,
    getState,
  };
}
