import { applyMiddleware, use } from '../core/use'
import { createStore } from '../core/store'
import effectMiddleware from '../middlewares/effect'
import loggerMiddleware from '../middlewares/logger'
import { ctx } from '../const/config'
import { compose } from '../utils/compose';
import TackyStoreTree from '../core/stateTree';
import { invariant } from '../utils/error';

export let isRunning = false;
/**
 * Includes init built-in middleware, create store, load domain global state and so on.
 */
export function init() {
  invariant(!isRunning, 'Cannot init store multiple times.');

  isRunning = true;

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
