import { stick } from './components/stick';
import { render } from './components/render';
import { use } from './core/use';
import { config } from './const/config';
import { mutation, reducer } from './core/updater';
import { effect } from './core/effect';
import { state } from './core/state';
import { Domain } from './core/domain';

// Proxy、Reflect、Symbol、Promise、WeakMap
// "plugins": [
//   "transform-decorators-legacy",
//   "transform-class-properties"
// ]

export default {
  stick,
  render,
  reducer,
  effect,
  mutation,
  use,
  config,
  state,
  Domain,
}

export {
  stick,
  render,
  reducer,
  effect,
  mutation,
  use,
  config,
  state,
  Domain,
}
