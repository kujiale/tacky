import { Middleware } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';

function createLoggerMiddleware(): Middleware {
  return ({ dispatch, getState }) => (next: any) => (action) => {
    console.group(
      `%caction: ${action.name}, namespace: ${action.namespace}, prev state:`,
      'color: red'
    );
    console.dir(deepMerge({}, getState(action.namespace), { clone: true })); // deep copy，logger current state before change.
    console.groupEnd();

    const nextResult = next(action); // wait the next middleware's result

    console.group(
      `%caction: ${action.name}, namespace: ${action.namespace}, next state:`,
      'color: green'
    );
    console.dir(deepMerge({}, getState(action.namespace), { clone: true })); // deep copy，logger current state after change.
    console.groupEnd();

    return nextResult;
  }
}

export default createLoggerMiddleware();
