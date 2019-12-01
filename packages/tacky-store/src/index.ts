import { stick } from './components/stick';
import { render } from './components/render';
import { use } from './core/use';
import { config } from './const/config';
import { mutation } from './decorators/updater';
import { effect } from './decorators/effect';
import { state } from './decorators/state';
import { Domain } from './core/domain';
import { init } from './core/init';
import { undo, redo, getTimeTravelStatus } from './core/collector';

// Proxy、Reflect、Symbol、Promise、Map、Set
// "plugins": [
//   "transform-decorators-legacy",
//   "transform-class-properties"
// ]

export default {
  stick,
  render,
  effect,
  mutation,
  use,
  config,
  state,
  Domain,
  init,
  undo,
  redo,
  getTimeTravelStatus,
}

export {
  stick,
  render,
  effect,
  mutation,
  use,
  config,
  state,
  Domain,
  init,
  undo,
  redo,
  getTimeTravelStatus,
}
