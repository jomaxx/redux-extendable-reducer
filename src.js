const INJECT = '@@rootReducer/INJECT';

export const inject = (reducers = {}) => ({
  type: INJECT,
  payload: reducers,
});

const reducersReducer = (reducers = {}, action) => {
  if (action.type === INJECT) {
    return Object.keys(action.payload).reduce((prevReducers, key) => {
      if (prevReducers[key] === action.payload[key]) return prevReducers;
      if (typeof prevReducers[key] !== 'undefined') throw new Error(`cannot replace ${key} reducer`);
      return { ...prevReducers, [key]: action.payload[key] };
    }, reducers);
  }

  return reducers;
};

export const rootReducer = (state = {}, action) => {
  const reducers = reducersReducer(state.__reducers, action);

  const nextState = Object.keys(reducers).reduce((prevState, key) => ({
    ...prevState,
    [key]: reducers[key](prevState[key], action),
  }), state);

  nextState.__reducers = reducers;

  return nextState;
};
