import { Action, buildDispatcher, Dispatcher, Update } from "affx";
import * as React from "react";

export interface DispatcherOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface WithAffxProps<State extends object, Actions extends Action> {
  dispatch: ReactDispatcher<Actions>;
  state: State;
}

const defaultDispatcherOptions: DispatcherOptions = {
  preventDefault: false,
  stopPropagation: false,
};

export interface ReactDispatcher<Actions extends Action>
  extends Dispatcher<Actions> {
  always<Event extends React.SyntheticEvent<any>>(
    action: Actions,
    options?: DispatcherOptions,
  ): (event: Event) => void;
}

const addReactToolsToDispatcher = <Actions extends Action>(
  dispatcher: Dispatcher<Actions>,
): ReactDispatcher<Actions> => {
  return Object.assign(dispatcher, {
    always<Event extends React.SyntheticEvent<any>>(
      action: Actions,
      options: DispatcherOptions = defaultDispatcherOptions,
    ) {
      return (event: Event) => {
        if (options.preventDefault) {
          event.preventDefault();
        }

        if (options.stopPropagation) {
          event.stopPropagation();
        }

        dispatcher(action);
      };
    },
  });
};

export function withAffx<State extends object, Actions extends Action>(
  initialState: State,
  update: Update<State, Actions>,
) {
  // tslint:disable-next-line:only-arrow-functions
  return function<OwnProps extends object>(
    Component: React.ComponentType<OwnProps & WithAffxProps<State, Actions>>,
  ): React.ComponentClass<OwnProps> {
    return class extends React.Component<OwnProps, State> {
      public state: State = initialState;

      private dispatch = addReactToolsToDispatcher<Actions>(
        buildDispatcher(() => this.state, this.setState.bind(this), update),
      );

      public render() {
        return (
          <Component
            {...this.props}
            dispatch={this.dispatch}
            state={this.state}
          />
        );
      }
    };
  };
}
