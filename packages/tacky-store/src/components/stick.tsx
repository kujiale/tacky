import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { store } from '../core/store';
import collector from '../core/collector';
import { useForceUpdate } from '../utils/react-hooks';
import generateUUID from '../utils/uuid';

interface WithUidProps {
  '<TACKY_COMPONENT_UUID>': string;
};

/**
 * Returns a high order component with auto refresh feature.
 */
export function stick(...args: any[]) {
  const decorator = <P extends object>(Target: React.ComponentType<P>) => {
    const displayName: string = Target.displayName || Target.name || '<TACKY_COMPONENT>';
    // Function component with react hooks
    function ObservableTarget(props: P) {
      const refreshView = useForceUpdate();

      React.useEffect(() => {
        const unsubscribeHandler = store.subscribe(() => {
          refreshView();
        }, `${displayName}__${this.uuid}`);

        return () => {
          if (unsubscribeHandler) {
            unsubscribeHandler();
          }
        };
      }, []);

      this.uuid = this.uuid || generateUUID();
      collector.start(this.uuid);
      const fn = Target as React.FunctionComponent<P>;
      const result = fn(props);
      collector.end();

      return result;
    };

    if (
      typeof Target === 'function' &&
      (!Target.prototype || !Target.prototype.render) &&
      !Target.prototype.isReactClass &&
      !React.Component.isPrototypeOf(Target)
    ) {
      const StickWithErrorBoundary: React.FunctionComponent<P> = (props) => {
        return (
          <ErrorBoundary>
            <ObservableTarget {...props as P} />
          </ErrorBoundary>
        );
      };
      const memoComponent = React.memo(StickWithErrorBoundary);

      copyStaticProperties(Target, memoComponent);

      return memoComponent;
    }

    const target = Target.prototype || Target;
    const baseRender = target.render;
    let callback: () => void;

    function refreshChildComponentView() {
      return () => React.Component.prototype.forceUpdate.call(this);
    }

    target.render = function () {
      callback = refreshChildComponentView.call(this);
      const id = this.props['<TACKY_COMPONENT_UUID>'];
      collector.start(id);
      const result = baseRender.call(this);
      collector.end();
      return result;
    }

    class ObservableTargetComponent extends React.PureComponent<P & WithUidProps> {
      unsubscribeHandler?: () => void;
      uuid: string;

      componentDidMount() {
        this.unsubscribeHandler = store.subscribe(() => {
          callback();
        }, this.uuid);
        /*
         * Trigger action on target component didMount is faster than subscribe listeners.
         * TACKY must fetch latest state manually to solve the problems above.
         */
        callback();
      }

      componentWillUnmount() {
        if (this.unsubscribeHandler) {
          this.unsubscribeHandler();
        }
      }

      render() {
        this.uuid = this.uuid || generateUUID();
        const props = {
          ...this.props as object,
          '<TACKY_COMPONENT_UUID>': `${displayName}__${this.uuid}`,
        };
        return (
          <ErrorBoundary>
            <Target {...props as P} />
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
    if (base.hasOwnProperty(key) && !hoistBlackList[key]) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!)
    }
  });
}
