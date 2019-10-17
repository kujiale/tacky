import { Store, DispatchedAction, Mutation, EMaterialType } from '../interfaces';
import { invariant } from '../utils/error';
import { historyCollector } from './collector';
import { nextTick, deduplicate, includes } from '../utils/common';
import { ctx } from '../../ts/const/config';
import * as ReactDOM from 'react-dom';
import { Component } from 'react';

export let store: Store;

export function createStore(enhancer: (createStore: any) => Store) {
  if (enhancer !== void 0) {
    store = enhancer(createStore);
    return store;
  }

  const componentUUIDToListeners: WeakMap<Component, Function[]> = new WeakMap();
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

  function subscribe(listener: Function, uuid: Component) {
    let isSubscribed = true;
    const listeners = componentUUIDToListeners.get(uuid);

    if (listeners === void 0) {
      componentUUIDToListeners.set(uuid, [listener]);
    } else {
      if (!includes(listeners, listener)) {
        componentUUIDToListeners.set(uuid, listeners.concat(listener));
      }
    }

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      if (componentUUIDToListeners.has(uuid)) {
        componentUUIDToListeners.delete(uuid);
      }
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
        if (historyCollector.waitTriggerComponentIds.length > 0) {
          const ids = deduplicate(historyCollector.waitTriggerComponentIds);
          const pendingListeners: Function[] = [];

          for (let index = 0; index < ids.length; index++) {
            const cid = ids[index];
            const listeners = componentUUIDToListeners.get(cid) || [];
            pendingListeners.push(...listeners);
          }

          ReactDOM.unstable_batchedUpdates(() => {
            for (let index = 0; index < pendingListeners.length; index++) {
              const listener = pendingListeners[index];
              listener();
            }
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
