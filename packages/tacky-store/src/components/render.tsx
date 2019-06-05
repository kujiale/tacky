import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { applyMiddleware, use } from '../core/use'
import { createStore } from '../core/store'
import effectMiddleware from '../middlewares/effect'
import loggerMiddleware from '../middlewares/logger'
import { ctx } from '../const/config'
import { compose } from '../utils/compose';
import TackyStoreTree from '../core/stateTree';

let started: boolean = false;

/**
 * Includes render on dom, init built-in middleware, create store, load domain global state and so on.
 */
export function render(
  component: React.ReactElement<any>,
  querySelector: string,
  callback?: () => void
): React.ReactElement<any> {
  if (!started) {
    // init built-in middleware
    if (ctx.middleware.effect) {
      use(effectMiddleware);
    }

    if (ctx.middleware.logger) {
      use(loggerMiddleware);
    }

    const enhancers = [applyMiddleware()];
    let composeEnhancers = compose;

    if (process.env.NODE_ENV !== 'production') {
      // Tacky dev tools extension support.
    }

    const enhancer = composeEnhancers(...enhancers);

    createStore(enhancer);
    // load all domain global state from instance
    TackyStoreTree.loadAll();
  }

  started = true;

  ReactDOM.render(component, document.querySelector(querySelector) as HTMLElement, callback);

  return component;
}
