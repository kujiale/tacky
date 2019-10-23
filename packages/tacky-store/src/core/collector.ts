import { includes } from '../utils/common';
import { ctx } from '../const/config';
import { Component } from 'react';

export interface KeyToComponentIdsMap {
  [key: string]: Component[];
};
/**
 * collect relation map of the dep key and the component ids
 */
class DepCollector {
  public dependencyMap = new WeakMap<object, KeyToComponentIdsMap>();
  private componentIdStack: Component[] = [];

  start(id: Component) {
    this.componentIdStack.push(id);
  }

  collect(targetKey: object, propKey: string) {
    const stackLength = this.componentIdStack.length;
    if (stackLength === 0) {
      return;
    }
    const currentComponentId = this.componentIdStack[stackLength - 1];
    const keyToComponentIdsMap = this.dependencyMap.get(targetKey);
    if (keyToComponentIdsMap !== void 0) {
      let idsArray = keyToComponentIdsMap[propKey];
      if (idsArray !== void 0) {
        if (!includes(idsArray, currentComponentId)) idsArray.push(currentComponentId);
      } else {
        keyToComponentIdsMap[propKey] = [currentComponentId];
      }
    } else {
      this.dependencyMap.set(targetKey, {
        [propKey]: [currentComponentId],
      });
    }
  }

  end() {
    this.componentIdStack.pop();
  }

  isObserved(targetKey: object, propKey: string) {
    const map = this.dependencyMap.get(targetKey);
    return map !== void 0 && propKey in map;
  }
}

export const depCollector = new DepCollector();

export const enum EOperationTypes {
  SET = 'set',
  ADD = 'add',
  DELETE = 'delete',
  CLEAR = 'clear',
  GET = 'get',
  HAS = 'has',
  ITERATE = 'iterate'
}

export interface KeyToDiffChangeMap {
  [key: string]: {
    beforeUpdate: any;
    didUpdate: any;
  };
}

export type History = WeakMap<object, KeyToDiffChangeMap>;

export type HistoryIdSet = Set<object>;

export interface HistoryNode {
  historyKey: HistoryIdSet;
  history: History;
}

export interface HistoryCollectorPayload {
  type: EOperationTypes;
  beforeUpdate: any;
  didUpdate: any;
}

/**
 * collect prop diff history record
 */
class HistoryCollector {
  public currentHistory?: History;
  public currentHistoryIdSet?: HistoryIdSet;
  public transactionHistories: HistoryNode[] = [];
  public waitTriggerComponentIds: Component[] = [];

  collect(target: object, key: string, payload: HistoryCollectorPayload) {
    this.collectComponentId(target, key);

    if (!ctx.timeTravel.isActive) {
      return;
    }

    const { beforeUpdate, didUpdate } = payload;
    if (this.currentHistoryIdSet === void 0) {
      this.currentHistoryIdSet = new Set();
    }
    if (this.currentHistory === void 0) {
      this.currentHistory = new WeakMap();
    }
    const keyToDiffChangeMap = this.currentHistory.get(target);

    if (keyToDiffChangeMap !== void 0) {
      if (keyToDiffChangeMap[key] !== void 0) {
        keyToDiffChangeMap[key].didUpdate = didUpdate;
      } else {
        keyToDiffChangeMap[key] = {
          beforeUpdate,
          didUpdate,
        };
      }
    } else {
      this.currentHistory.set(target, {
        [key]: {
          beforeUpdate,
          didUpdate,
        }
      });
    }

    this.currentHistoryIdSet.add(target);
  }

  collectComponentId(target: object, key: string) {
    const keyToComponentIdsMap = depCollector.dependencyMap.get(target);
    if (keyToComponentIdsMap === void 0) {
      return;
    }
    const idsArray = keyToComponentIdsMap[key];
    if (idsArray === void 0 || idsArray.length === 0) {
      return;
    }
    this.waitTriggerComponentIds.push(...idsArray);
  }

  endBatch() {
    this.waitTriggerComponentIds = [];
    if (!ctx.timeTravel.isActive) {
      return;
    }
    this.currentHistory = void 0;
    this.currentHistoryIdSet = void 0;
  }

  save() {
    this.transactionHistories.push({
      historyKey: this.currentHistoryIdSet!,
      history: this.currentHistory!,
    });
    if (this.transactionHistories.length > ctx.timeTravel.maxStepNumber) {
      this.transactionHistories.shift();
    }
  }
}

export const historyCollector = new HistoryCollector();
