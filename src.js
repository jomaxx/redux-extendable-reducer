'use strict';

const EXTEND_REDUCER = '@@redux-extendable-reducer/EXTEND_REDUCER';

export function extendReducer(reducers) {
  return {
    type: EXTEND_REDUCER,
    payload: reducers,
    meta: { keys: Object.keys(reducers) },
  };
}

function reducersReducer(state = {}, action) {
  if (action.type === EXTEND_REDUCER) {
    const nextState = Object.assign({}, state);

    for (let key in action.payload) {
      if (action.payload.hasOwnProperty(key)) {
        if (nextState[key] && nextState[key] !== action.payload[key]) {
          console.warn(`attempt to replace reducers.${key} was ignored.`);
        } else if (typeof action.payload[key] === 'function') {
          nextState[key] = action.payload[key];
        } else {
          throw new Error(`reducers.${key} is not a function`);
        }
      }
    }

    return nextState;
  }

  return state;
}

function buffersReducer(state = {}, action) {
  const nextState = Object.assign({}, state);

  if (action.type === EXTEND_REDUCER) {
    action.meta.keys.forEach(key => {
      nextState[key] = nextState[key] || [];
    });
  }

  for (let key in nextState) {
    if (nextState.hasOwnProperty(key)) {
      nextState[key] = nextState[key].concat(action);
    }
  }

  return nextState;
}

export default function extendableReducer(state, action) {
  const nextState = Object.assign({}, state);
  const reducers = nextState.__reducers = reducersReducer(nextState.__reducers, action);
  const buffers = nextState.__buffers = buffersReducer(nextState.__buffers, action);

  // flush buffers
  for (let key in buffers) {
    if (buffers.hasOwnProperty(key) && reducers.hasOwnProperty(key)) {
      nextState[key] = buffers[key].reduce(reducers[key], nextState[key]);
      buffers[key].splice(0);
    }
  }

  return nextState;
}
