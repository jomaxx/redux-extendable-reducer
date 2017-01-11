import { createStore } from 'redux';

const BUFFER = '@@rootReducer/BUFFER';

const bufferReducer = (state = {}, action) => {
  let nextState = state;

  if (action.type === BUFFER) {
    nextState = action.payload.reduce((prev, key) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: [] };
    }, nextState);
  }

  return Object.keys(nextState).reduce((prev, key) => ({
    ...prev,
    [key]: [ ...prev[key], action ],
  }), nextState);
};

const createRootReducer = (reducers = {}) => (state = {}, action) => {
  const buffer = bufferReducer(state.__buffer, action);

  const nextState = Object.keys(reducers).reduce((prev, key) => (!buffer[key] ? prev : {
    ...prev,
    [key]: buffer[key].splice(0).reduce(reducers[key], prev[key]),
  }), state);

  return {
    ...nextState,
    __buffer: buffer,
  };
};

export const configureStore = (...args) => {
  let reducers = {};

  const store = createStore(createRootReducer(reducers), ...args);

  const replaceReducer = () => {
    throw new Error('cannot replace root reducer');
  };

  const inject = (injectedReducers) => {
    const keys = Object.keys(injectedReducers);

    const nextReducers = keys.reduce((prev, key) => {
      const reducer = injectedReducers[key];
      if (typeof reducer !== 'function') throw new Error(`'${key}' is not a function`);
      if (prev[key] === reducer) return prev;
      if (prev[key]) throw new Error(`cannot replace ${key} reducer`);
      return { ...prev, [key]: reducer };
    }, reducers);

    store.dispatch({
      type: BUFFER,
      payload: keys,
    });

    if (nextReducers !== reducers) {
      reducers = nextReducers;
      store.replaceReducer(createRootReducer(reducers));
    }
  };

  return {
    ...store,
    replaceReducer,
    inject,
  };
};
