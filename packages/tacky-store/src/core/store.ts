import { Store, DispatchedAction, Mutation, EMaterialType } from '../interfaces';
import { invariant } from '../utils/error';
import { depCollector, historyCollector } from './collector';
import { shallowEqual, nextTick, deduplicate } from '../utils/common';
import DomainStore from './domain-store';
import { ctx } from '../../ts/const/config';
import * as ReactDOM from 'react-dom';

export let store: Store;

export function createStore(enhancer: (createStore: any) => Store) {
  if (enhancer !== void 0) {
    store = enhancer(createStore);
    return store;
  }

  const componentUUIDToListeners = {};
  let isUpdating: boolean = false;
  let isInBatch: boolean = false;

  function getState(namespace?: string) {
    // invariant(!isUpdating, 'You may not call store.getState() while the mutation/reducer is executing.');

    // if (namespace) {
    //   const atom = DomainStore.globalStateTree[namespace] as AtomStateTree;
    //   return atom.plainObject;
    // }

    // return DomainStore.globalStateTree;
  }

  function subscribe(listener: Function, uuid: string) {
    let isSubscribed = true;

    if (componentUUIDToListeners[uuid] === void 0) {
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
    /**
     * @todo action name need to record
     */
    const {
      name,
      payload,
      type,
      namespace,
      original,
    } = action;

    invariant(!isUpdating, 'Cannot trigger other mutation while the current mutation is executing.');

    try {
      isUpdating = true;
      if (type !== EMaterialType.MUTATION) {
        return;
      }
      const currentMutation = original as Mutation;
      currentMutation(...payload);
    } finally {
      isUpdating = false;
    }

    if (!isInBatch) {
      isInBatch = true;
      nextTick(() => {
        const current = historyCollector.currentHistory;
        depCollector.dependencyMap;
        if (current !== void 0) {
          const ids = deduplicate(historyCollector.waitTriggerComponentIds);
          const tempListeners: Function[] = [];

          for (let index = 0; index < ids.length; index++) {
            const cid = ids[index];
            const listeners = componentUUIDToListeners[cid] || [];
            tempListeners.push(...listeners);
          }

          // for (let index = 0; index < tempListeners.length; index++) {
          //   const listener = tempListeners[index];
          //   listener();
          // }
          ReactDOM.unstable_batchedUpdates(() => {
            pendingComponents.forEach(component => component.forceUpdate());
          });
        }
        if (ctx.timeTravel.isActive) {
          historyCollector.save();
        }
        historyCollector.endBatch();
        isInBatch = false;
      });
    }

    return action;
  }

  return {
    dispatch,
    subscribe,
    getState,
  };
}
