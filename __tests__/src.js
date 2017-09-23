import { createStore } from 'redux';
import rootReducer, { extendReducer } from '../src';

const done = (state = [], action) => state.concat(action);
const doneAction = { type: 'DONE' };

const consoleWarn = console.warn;

beforeAll(() => {
  console.warn = jest.fn(consoleWarn);
});

beforeEach(() => {
  jest.resetAllMocks();
});

afterAll(() => {
  console.warn = consoleWarn;
});

it('extends reducer', () => {
  const store = createStore(rootReducer);
  store.dispatch(extendReducer({ done }));
  store.dispatch(doneAction);
  expect(store.getState().done).toMatchSnapshot();
});

it('buffers actions until reducer is extended', () => {
  const serverStore = createStore(rootReducer);
  serverStore.dispatch(extendReducer({ done }));
  const initialState = JSON.parse(JSON.stringify(serverStore.getState()));
  const clientStore = createStore(rootReducer, initialState);
  clientStore.dispatch(doneAction);
  clientStore.dispatch(extendReducer({ done }));
  expect(clientStore.getState().done).toMatchSnapshot();
});

it('throws error when reducer is not a function', () => {
  const store = createStore(rootReducer);
  expect(() => store.dispatch(extendReducer({ done: true }))).toThrowErrorMatchingSnapshot();
});

it('warns when attempting to replace reducer', () => {
  console.warn.mockImplementationOnce(() => {});
  const store = createStore(rootReducer);
  store.dispatch(extendReducer({ done }));
  store.dispatch(extendReducer({ done() {} }));
  expect(console.warn.mock.calls).toMatchSnapshot();
});
