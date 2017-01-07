import { createStore } from 'redux';
import { rootReducer, inject } from '../src';

const __reducers = {
  done: (state, action) => state || action.type === 'DONE',
};

it('should have no injected reducers by default', () => {
  const { dispatch, getState } = createStore(rootReducer);
  expect(getState()).toEqual({ __reducers: {} });
});

it('should hydrate with initial injected reducers', () => {
  const { dispatch, getState } = createStore(rootReducer, { __reducers });
  expect(getState()).toEqual({ done: false, __reducers });
  dispatch({ type: 'DONE' });
  expect(getState()).toEqual({ done: true, __reducers });
});

it('should inject reducers', () => {
  const { dispatch, getState } = createStore(rootReducer);
  dispatch(inject(__reducers));
  expect(getState()).toEqual({ done: false, __reducers });
  dispatch({ type: 'DONE' });
  expect(getState()).toEqual({ done: true, __reducers });
});

it('should throw error if attempt to replace injected reducer', () => {
  const { dispatch, getState } = createStore(rootReducer);
  dispatch(inject(__reducers));
  expect(() => dispatch(inject({ done: () => {} }))).toThrowError();
});

// common way of hydrating from server is to JSON.stringify then JSON.parse
it('should remove injected reducers when put through JSON.stringify', () => {
  const { dispatch, getState } = createStore(rootReducer, { __reducers });
  dispatch({ type: 'DONE' });
  const stringified = JSON.stringify(getState());
  const parsed = JSON.parse(stringified);
  expect(parsed).toEqual({ done: true, __reducers: {} });
});
