import * as React from 'react'
import { Domain } from './core/domain';

export type MiddlewareParam = {
  dispatch: (action: DispatchedAction) => DispatchedAction,
  getState: (namespace?: string) => ModuleState | GlobalStateTree
}

export interface Middleware {
  ({ dispatch, getState }: MiddlewareParam): (next: any) => (action: DispatchedAction) => any
}

export interface Store {
  dispatch: (action: DispatchedAction) => DispatchedAction,
  subscribe: (listener: Function, componentInstanceUid: string) => () => void,
  getState: (namespace?: string) => ModuleState | GlobalStateTree
}

export interface AtomStateTree {
  instance: Domain,
  plainObject: ModuleState,
  default: ModuleState
}

export interface ModuleState {
  [key: string]: any
}

export interface GlobalStateTree {
  [namespace: string]: AtomStateTree
}

export interface Reducer {
  (state: ModuleState, ...restPayload: any[]): ModuleState
}

export interface Mutation {
  (...restPayload: any[]): void
}

export interface Effect {
  (...restPayload: any[]): Promise<void>
}

export enum MaterialType {
  Reducer,
  Mutation,
  Effect,
  Noop,
}

export interface DispatchedAction {
  name?: string,
  payload: any[],
  type: MaterialType,
  namespace: string,
  original: Reducer | Effect | Mutation
}

export interface ConfigCtx {
  middleware: {
    logger: boolean,
    effect: boolean
  },
  devTool: boolean
}

export type BabelDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => any }
