import mobxReact from "mobx-react";

export default {
  ...mobxReact,
  observer
};

export * from "mobx-react";

const observerMixinFunctionNames = [
  "componentWillMount",
  "componentWillUnmount",
  "componentDidMount",
  "componentDidUpdate",
  "shouldComponentUpdate"
];

const mobxReactObserverMixin = (() => {
  // mobx-react"s observer() works both as a component class decorator and a
  // higher-order function for wrapping statless component function. It
  // differentiates them by several checks, but setting isReactClass
  // property is enough to present function as a component class.
  //
  // It matters because observer() creates new class for component function
  // with some additional methods beside mixin methods, but for component
  // class without any instance methods it will just mix in mixin functions.
  const blankClass = class {
    static isReactClass = true;
  };
  const protoWithMixin = mobxReact.observer(blankClass).prototype;

  return observerMixinFunctionNames.reduce((reconstructedMixin, fnName) => {
    reconstructedMixin[fnName] = protoWithMixin[fnName];
    return reconstructedMixin;
  }, {});
})();

export function observer(componentClass) {
  const mixinTarget = (componentClass.prototype || componentClass);
  const originalComponentWillMount = mixinTarget.componentWillMount;
  const decoratedClass = mobxReact.observer(componentClass);

  // Restore original componentWillMount (or its" absence).
  if (originalComponentWillMount) {
    mixinTarget.componentWillMount = originalComponentWillMount;
  } else {
    delete mixinTarget.componentWillMount;
  }

  // Setup MobX reaction in object constructing.
  const observableClass = class extends decoratedClass {
    constructor() {
      super();
      mobxReactObserverMixin.componentWillMount.apply(this);
    }
  };

  // Return class with class name set to the original component class name.
  return Object.defineProperty(observableClass, "name", {
    ...Object.getOwnPropertyDescriptor(observableClass, "name"),
    value: componentClass.name
  });
}
