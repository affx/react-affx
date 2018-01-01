import {
  Action,
  ActionCreator,
  createDispatcher,
  Dispatcher,
  Update,
} from "affx";
import * as React from "react";

export type MapStateToProps<State extends object, StateProps extends object> = (
  state: State,
) => StateProps;

export interface DispatcherOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export type WithAffxProps<
  State extends object,
  Actions extends Action
> = State & {
  dispatch: ReactDispatcher<Actions>;
};

export interface ReactDispatcher<Actions extends Action>
  extends Dispatcher<Actions> {
  always<Event extends React.SyntheticEvent<any>>(
    action: Actions,
    options?: DispatcherOptions,
  ): (event: Event) => void;
}

export declare type ReactDispatcherMapper = <
  Actions extends Action,
  MappedActions extends Action
>(
  actionCreator: ActionCreator<MappedActions, Actions>,
  dispatcher: ReactDispatcher<Actions>,
) => ReactDispatcher<MappedActions>;

export interface WithAffx {
  <State extends object, Actions extends Action>(
    initialState: State,
    update: Update<State, Actions>,
    mapStateToProps?: null,
  ): <OwnProps extends object>(
    Component: React.ComponentType<OwnProps & WithAffxProps<State, Actions>>,
  ) => React.ComponentClass<OwnProps>;

  <State extends object, Actions extends Action, StateProps extends object>(
    initialState: State,
    update: Update<State, Actions>,
    mapStateToProps: MapStateToProps<State, StateProps>,
  ): <OwnProps extends object>(
    Component: React.ComponentType<
      OwnProps & WithAffxProps<StateProps, Actions>
    >,
  ) => React.ComponentClass<OwnProps>;
}

const defaultDispatcherOptions: DispatcherOptions = {
  preventDefault: false,
  stopPropagation: false,
};

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

export const mapReactDispatcher: ReactDispatcherMapper = (
  actionCreator,
  dispatcher,
) =>
  addReactToolsToDispatcher(async action => {
    if (action) {
      await dispatcher(actionCreator(action));
    }
  });

export const withAffx: WithAffx = <
  State extends object,
  Actions extends Action,
  StateProps extends object
>(
  initialState: State,
  update: Update<State, Actions>,
  mapStateToProps?: MapStateToProps<State, StateProps> | null,
): (<OwnProps extends object>(
  Component: React.ComponentType<OwnProps & WithAffxProps<StateProps, Actions>>,
) => React.ComponentClass<OwnProps>) => <OwnProps extends object>(
  Component: React.ComponentType<OwnProps & WithAffxProps<StateProps, Actions>>,
): React.ComponentClass<OwnProps> =>
  class extends React.PureComponent<OwnProps, State> {
    public state: State = initialState;

    private dispatch = addReactToolsToDispatcher<Actions>(
      createDispatcher(() => this.state, this.setState.bind(this), update),
    );

    public render() {
      const stateProps = mapStateToProps
        ? mapStateToProps(this.state)
        : this.state;

      return (
        <Component {...this.props} {...stateProps} dispatch={this.dispatch} />
      );
    }
  };
