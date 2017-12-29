import { Action, Update } from "affx";
import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { withAffx, WithAffxProps } from "./index";

Enzyme.configure({ adapter: new Adapter() });

interface BasicState {
  counter: number;
}

type NoOpAction = Action<"NOOP">;

describe("withAffx", () => {
  it("should add dispatch and state props to a StatelessComponent", () => {
    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, NoOpAction>
    > = () => <></>;

    const fakeWithAffx = withAffx<BasicState, NoOpAction>(
      null as any,
      null as any,
    );

    const Component = fakeWithAffx(PartialComponent);

    const component = Enzyme.shallow(<Component />);

    expect(component.props()).toHaveProperty("dispatch");
    expect(component.props()).toHaveProperty("dispatch.always");
    expect(component.props()).toHaveProperty("state");
  });

  it("should add a state props containing the given state", () => {
    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, NoOpAction>
    > = () => <></>;

    const initialState: BasicState = { counter: 42 };

    const fakeWithAffx = withAffx<BasicState, NoOpAction>(
      initialState,
      null as any,
    );

    const Component = fakeWithAffx(PartialComponent);

    const component = Enzyme.shallow(<Component />);

    expect(component.props()).toHaveProperty("state", initialState);
  });

  it.skip(
    "should add a dispatch.always props which may preventDefault and stopPropagation on given Event",
  );

  it.skip("should not re-render on noop and side effects");

  it.skip("should re-render on update and update with side effects");
});
