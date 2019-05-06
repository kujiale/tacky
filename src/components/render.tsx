import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { applyMiddleware, use } from '../core/use'
import { createStore } from '../core/store'
import effectMiddleware from '../middlewares/effect'
import loggerMiddleware from '../middlewares/logger'
import { ctx } from '../const/config'
import { compose } from '../utils/compose';
import StickyTree from '../core/stateTree';

let started: boolean = false;

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
      // Sticky dev tools extension support.
    }

    const enhancer = composeEnhancers(...enhancers);

    createStore(enhancer);
    // load all domain
    StickyTree.loadAll();
  }

  started = true;

  ReactDOM.render(component, document.querySelector(querySelector) as HTMLElement, callback);

  return component;
}
