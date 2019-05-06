import * as React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { store } from '../core/store';
import { COMPONENT_INSTANCE_UID } from '../const/symbol';
import collector from '../core/collector';

interface Props {
  [propName: string]: any
}

interface State {
  [stateName: string]: any
}

let countId = 0;

export function stick() {
  return (Target: React.ComponentClass): React.ComponentClass => {
    const displayName: string = Target.displayName || Target.name || '@@sticky_component';
    const target = Target.prototype || Target;
    const baseRender = target.render;

    target.render = function () {
      const id = this.props['@@STICKY__componentInstanceUid'];
      collector.start(id);
      const result = baseRender.call(this);
      collector.end();
      return result;
    }

    return class extends React.Component<Props, State> {
      unsubscribeHandler?: () => void;
      componentInstanceUid: string = `@@${displayName}__${++countId}`;

      constructor(props) {
        super(props);
      }

      refreshView() {
        this.forceUpdate();
      }

      componentDidMount() {
        this.unsubscribeHandler = store.subscribe(() => {
          this.refreshView();
        }, this.componentInstanceUid);
        /*
         * 1. Trigger action on target component didMount is faster than subscribe listeners.
         * 2. React 17, component rendering is async, might have been interrupted.
         * sticky must fetch latest state manually to solve the problems above.
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
          ...this.props,
          '@@STICKY__componentInstanceUid': this.componentInstanceUid,
        };
        return (
          <ErrorBoundary>
            <Target {...props} />
          </ErrorBoundary>
        )
      }
    }
  }
}