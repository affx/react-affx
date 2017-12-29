import { Action, ActionCreator, Update } from "affx";
import { randomInt } from "affx-affects";
import * as React from "react";
import { render } from "react-dom";

import { withAffx, WithAffxProps } from "../src/index";

// State
interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

// Actions
interface SetAction extends Action<"SET"> {
  readonly value: CounterState["value"];
}

const set = (value: CounterState["value"]): SetAction => ({
  type: "SET",
  value,
});

type CounterActions =
  | Action<"INCREMENT">
  | Action<"DECREMENT">
  | Action<"RANDOM">
  | SetAction;

// Update
const update: Update<CounterState, CounterActions> = action => state => {
  switch (action.type) {
    case "INCREMENT":
      return {
        state: {
          ...state,
          value: state.value + 1,
        },
      };

    case "DECREMENT":
      return {
        state: {
          ...state,
          value: state.value - 1,
        },
      };

    case "RANDOM":
      return {
        commands: [randomInt(1000)(set)],
        state,
      };

    case "SET":
      return {
        state: {
          ...state,
          value: action.value,
        },
      };

    default:
      return { state };
  }
};

// Component
interface OwnProps {
  title: string;
}

const PartialCounter: React.StatelessComponent<
  OwnProps & WithAffxProps<CounterState, CounterActions>
> = ({ dispatch, state, title }) => {
  return (
    <>
      <h1>{title}</h1>
      <button onClick={dispatch.always({ type: "INCREMENT" })}>+</button>
      <button onClick={dispatch.always({ type: "DECREMENT" })}>-</button>
      <button onClick={dispatch.always({ type: "RANDOM" })}>random</button>
      <strong>{state.value.toString()}</strong>
    </>
  );
};

const Counter = withAffx(initialState, update)(PartialCounter);

render(<Counter title="Counter" />, document.getElementById("root"));
