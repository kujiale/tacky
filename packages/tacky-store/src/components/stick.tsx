import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { store } from '../core/store';
import collector from '../core/collector';
import { useForceUpdate } from '../utils/hooks';

interface WithUidProps {
  '@@TACKY__componentInstanceUid': string;
};

let countId = 0;
/**
 * Returns a high order component with auto refresh feature.
 */
export function stick(...args: any[]) {
  const decorator = <P extends object>(Target: React.ComponentType<P>) => {
    const displayName: string = Target.displayName || Target.name || 'TACKY_COMPONENT';
    // Function component with react hooks
    if (
      typeof Target === 'function' &&
      (!Target.prototype || !Target.prototype.render) &&
      !Target.prototype.isReactClass &&
      !React.Component.isPrototypeOf(Target)
    ) {
      // function component, no instance, share the same id
      const componentInstanceUid: string = `@@${displayName}__${++countId}`;
      const Stick: React.FunctionComponent<P> = (props) => {
        const refreshView = useForceUpdate();

        React.useEffect(() => {
          const unsubscribeHandler = store.subscribe(() => {
            refreshView();
          }, componentInstanceUid);

          return () => {
            if (unsubscribeHandler) {
              unsubscribeHandler();
            }
          };
        }, [componentInstanceUid]);

        collector.start(componentInstanceUid);
        const fn = Target as React.FunctionComponent<P>;
        const result = fn(props);
        collector.end();

        return result;
      };

      const StickWithErrorBoundary: React.FunctionComponent<P> = (props) => {
        return (
          <ErrorBoundary>
            <Stick {...props as P} />
          </ErrorBoundary>
        );
      };
      const memoComponent = React.memo(StickWithErrorBoundary);

      copyStaticProperties(Target, memoComponent);

      return memoComponent;
    }

    const target = Target.prototype || Target;
    const baseRender = target.render;

    target.render = function () {
      const id = this.props['@@TACKY__componentInstanceUid'];
      collector.start(id);
      const result = baseRender.call(this);
      collector.end();
      return result;
    }

    class Stick extends React.PureComponent<P & WithUidProps> {
      unsubscribeHandler?: () => void;
      componentInstanceUid: string = `@@${displayName}__${++countId}`;

      refreshView() {
        this.forceUpdate();
      }

      componentDidMount() {
        this.unsubscribeHandler = store.subscribe(() => {
          this.refreshView();
        }, this.componentInstanceUid);
        /*
         * Trigger action on target component didMount is faster than subscribe listeners.
         * TACKY must fetch latest state manually to solve the problems above.
         */
        this.refreshView();
      }

      componentWillUnmount() {
        if (this.unsubscribeHandler) {
          this.unsubscribeHandler();
        }
      }

      render() {
        const props = {
          ...this.props as object,
          '@@TACKY__componentInstanceUid': this.componentInstanceUid,
        };
        return (
          <ErrorBoundary>
            <Target {...props as P} />
          </ErrorBoundary>
        )
      }
    }

    copyStaticProperties(Target, Stick);

    return Stick;
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
