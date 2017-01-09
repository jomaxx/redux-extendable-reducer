import { configureStore } from '../src';

const doneReducer = (state, action) => state || action.type === 'DONE';

it('should inject reducer', () => {
  const store = configureStore();
  store.dispatch({ type: 'DONE' });
  expect(store.getState().done).toEqual(undefined);
  store.inject({ done: doneReducer });
  expect(store.getState().done).toEqual(false);
  store.dispatch({ type: 'DONE' });
  expect(store.getState().done).toEqual(true);
});

it('should buffer actions then flush once reducer is injected', () => {
  const serverStore = configureStore();
  serverStore.inject({ done: doneReducer });
  const initialState = JSON.parse(JSON.stringify(serverStore.getState()));
  const clientStore = configureStore(initialState);
  clientStore.dispatch({ type: 'DONE' });
  expect(clientStore.getState().done).toEqual(false);
  clientStore.inject({ done: doneReducer });
  expect(clientStore.getState().done).toEqual(true);
});

it('should throw error when reducer is not a function', () => {
  const store = configureStore();
  expect(() => store.inject({ done: true })).toThrowError();
});

it('should throw error when attempting to replace reducer', () => {
  const store = configureStore();
  store.inject({ done: doneReducer });
  expect(() => store.inject({ done: doneReducer })).not.toThrowError();
  expect(() => store.inject({ done() {} })).toThrowError();
});

it('should throw error when attempting to replace root reducer', () => {
  const store = configureStore();
  expect(() => store.replaceReducer(() => {})).toThrowError();
});
