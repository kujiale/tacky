import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { store } from '../core/store';
import { depCollector } from '../core/collector';

/**
 * Returns a high order component with auto refresh feature.
 */
export function stick(...args: any[]) {
  const decorator = <P extends object>(Target: React.ComponentType<P>) => {
    // const displayName: string = Target.displayName || Target.name || '<TACKY_COMPONENT>';
    /**
     * @todo maybe function component
     */
    let _this: React.Component;
    // Function component with react hooks do not have this context
    function ObservableTarget(props: P) {
      depCollector.start(_this);
      const fn = Target as React.FunctionComponent<P>;
      const result = fn(props);
      depCollector.end();
      return result;
    };

    if (
      typeof Target === 'function' &&
      (!Target.prototype || !Target.prototype.render) &&
      !Target.prototype.isReactClass &&
      !React.Component.isPrototypeOf(Target)
    ) {
      class Wrapper extends React.PureComponent<P> {
        unsubscribeHandler?: () => void;

        componentDidMount() {
          this.unsubscribeHandler = store.subscribe(() => {
            this.forceUpdate();
          }, _this);
          /*
          * Trigger action on target component didMount is faster than subscribe listeners.
          * TACKY must fetch latest state manually to solve the problems above.
          */
          /**
           * @todo need to be confirmed.
           */
          // callback();
        }

        componentWillUnmount() {
          if (this.unsubscribeHandler !== void 0) {
            this.unsubscribeHandler();
          }
        }

        render() {
          return (
            <ErrorBoundary>
              <ObservableTarget {...this.props as P} />
            </ErrorBoundary>
          )
        }
      }

      const baseRender = Wrapper.prototype.render;

      Wrapper.prototype.render = function () {
        _this = this;
        return baseRender.call(this);
      }

      copyStaticProperties(Target, Wrapper);

      return Wrapper;
    }

    // class component
    const target = Target.prototype || Target;
    const baseRender = target.render;
    let callback: () => void;

    function refreshChildComponentView() {
      return () => React.Component.prototype.forceUpdate.call(this);
    }

    target.render = function () {
      _this = this;
      callback = refreshChildComponentView.call(this);
      depCollector.start(this);
      const result = baseRender.call(this);
      depCollector.end();
      return result;
    }

    class ObservableTargetComponent extends React.PureComponent<P> {
      unsubscribeHandler?: () => void;

      componentDidMount() {
        this.unsubscribeHandler = store.subscribe(() => {
          callback();
        }, _this);
        /*
         * Trigger action on target component didMount is faster than subscribe listeners.
         * TACKY must fetch latest state manually to solve the problems above.
         */
        /**
         * @todo need to be confirmed.
         */
        // callback();
      }

      componentWillUnmount() {
        if (this.unsubscribeHandler !== void 0) {
          this.unsubscribeHandler();
        }
      }

      render() {
        return (
          <ErrorBoundary>
            <Target {...this.props as P} />
          </ErrorBoundary>
        )
      }
    }

    copyStaticProperties(Target, ObservableTargetComponent);

    return ObservableTargetComponent;
  };

  if (args.length === 1 && typeof args[0] === 'function') {
    // @decorator
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  return decorator;
}

// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
const hoistBlackList: any = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true
}

function copyStaticProperties(base: any, target: any) {
  Object.keys(base).forEach(key => {
    if (base.hasOwnProperty(key) && hoistBlackList[key] === void 0) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!)
    }
  });
}
