import { Action, Command, Update } from "affx";
import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as React from "react";

import { ReactDispatcher, withAffx, WithAffxProps } from "./index";

Enzyme.configure({ adapter: new Adapter() });

interface BasicState {
  counter: number;
}

type NoOpAction = Action<"NOOP">;

type EndAction = Action<"END">;

describe("withAffx", () => {
  it("should add dispatch and the spread state as props to a StatelessComponent", () => {
    const initialState = { fakeKey1: "fakeValue1", fakeKey2: "fakeValue2" };

    const fakeWithAffx = withAffx<typeof initialState, NoOpAction>(
      initialState,
      null as any,
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<typeof initialState, NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const component = Enzyme.shallow(<Component />);

    expect(component.props()).toHaveProperty("dispatch");
    expect(component.props()).toHaveProperty("dispatch.always");
    expect(component.props()).toHaveProperty("fakeKey1", "fakeValue1");
    expect(component.props()).toHaveProperty("fakeKey2", "fakeValue2");
  });

  it("should add the spread state as props containing the given state", () => {
    const initialState: BasicState = { counter: 42 };

    const fakeWithAffx = withAffx<BasicState, NoOpAction>(
      initialState,
      null as any,
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const component = Enzyme.shallow(<Component />);

    expect(component.props()).toHaveProperty("counter", 42);
  });

  it("should add a dispatch.always props which calls preventDefault and stopPropagation on given Event", () => {
    const initialState: BasicState = { counter: 42 };

    const fakeWithAffx = withAffx<BasicState, NoOpAction>(
      initialState,
      null as any,
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const component = Enzyme.shallow(<Component />);

    const fakeEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    const { always }: ReactDispatcher<NoOpAction> = component.props().dispatch;

    always(null as any, {
      preventDefault: true,
      stopPropagation: true,
    })(fakeEvent as any);

    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
  });

  it("should add a dispatch.always props which does not call preventDefault and stopPropagation on given Event by default", () => {
    const initialState: BasicState = { counter: 42 };

    const fakeWithAffx = withAffx<BasicState, NoOpAction>(
      initialState,
      null as any,
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const component = Enzyme.shallow(<Component />);

    const fakeEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };

    const { always }: ReactDispatcher<NoOpAction> = component.props().dispatch;

    always(null as any)(fakeEvent as any);

    expect(fakeEvent.preventDefault).not.toHaveBeenCalled();
    expect(fakeEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it("should not re-render on noop", async () => {
    const initialState: BasicState = { counter: 42 };

    const fakeWithAffx = withAffx<BasicState, NoOpAction>(
      initialState,
      action => state => ({ state }),
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const componentInstance = Enzyme.shallow(<Component />).instance();

    const fakeRender = jest.spyOn(componentInstance, "render");

    const dispatch: ReactDispatcher<NoOpAction> = (componentInstance as any)
      .dispatch;

    await dispatch({ type: "NOOP" });

    expect(fakeRender).not.toHaveBeenCalled();
  });

  it("should not re-render on side effects", async () => {
    const initialState: BasicState = { counter: 42 };

    const fakeCommand: Command<EndAction> = () =>
      Promise.resolve<EndAction>({ type: "END" });

    const fakeWithAffx = withAffx<BasicState, EndAction | NoOpAction>(
      initialState,
      action => state => {
        switch (action.type) {
          case "NOOP":
            return { commands: [fakeCommand], state };
          default:
            return { state };
        }
      },
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, EndAction | NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const componentInstance = Enzyme.shallow(<Component />).instance();

    const fakeRender = jest.spyOn(componentInstance, "render");

    const dispatch: ReactDispatcher<NoOpAction> = (componentInstance as any)
      .dispatch;

    await dispatch({ type: "NOOP" });

    expect(fakeRender).not.toHaveBeenCalled();
  });

  it("should re-render on update", async () => {
    const initialState: BasicState = { counter: 42 };

    const fakeWithAffx = withAffx<BasicState, NoOpAction>(
      initialState,
      action => state => ({ state: { counter: state.counter + 1 } }),
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const componentInstance = Enzyme.shallow(<Component />).instance();

    const fakeRender = jest.spyOn(componentInstance, "render");

    const dispatch: ReactDispatcher<NoOpAction> = (componentInstance as any)
      .dispatch;

    await dispatch({ type: "NOOP" });

    expect(fakeRender).toHaveBeenCalled();
  });

  it("should re-render on update with side effects", async () => {
    const initialState: BasicState = { counter: 42 };

    const fakeCommand: Command<EndAction> = () =>
      Promise.resolve<EndAction>({ type: "END" });

    const fakeWithAffx = withAffx<BasicState, EndAction | NoOpAction>(
      initialState,
      action => state => {
        switch (action.type) {
          case "NOOP":
            return {
              commands: [fakeCommand],
              state: { counter: state.counter + 1 },
            };
          default:
            return { state };
        }
      },
    );

    const PartialComponent: React.StatelessComponent<
      object & WithAffxProps<BasicState, EndAction | NoOpAction>
    > = () => <></>;

    const Component = fakeWithAffx(PartialComponent);

    const componentInstance = Enzyme.shallow(<Component />).instance();

    const fakeRender = jest.spyOn(componentInstance, "render");

    const dispatch: ReactDispatcher<NoOpAction> = (componentInstance as any)
      .dispatch;

    await dispatch({ type: "NOOP" });

    expect(fakeRender).toHaveBeenCalled();
  });
});
