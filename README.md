# redux-injectable-reducer
Redux store capable of lazily injecting parts of the state tree. Useful for large single page applications that utilize bundle splitting.

## Inspiration

This library is influenced by [redux-injectable-store](https://github.com/lelandrichardson/redux-injectable-store). Please take a look there before relying on this library. Currently, the main difference between the two libraries is [Action Buffering](#action-buffering).

## Install

```
npm install --save redux redux-injectable-reducer
```

## Usage

```js
import { configureStore } from 'redux-injectable-reducer';

const store = configureStore();

store.dispatch({ type: 'INCREMENT' });

console.log(store.getState().count); // undefined

const countReducer = (state = 0, action) => {
  if (action.type === 'INCREMENT') return state + 1;
  return state;
};

store.inject({ count: countReducer });

console.log(store.getState().count); // 0

store.dispatch({ type: 'INCREMENT' });

console.log(store.getState().count); // 1
```

### with React

```js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { configureStore } from 'redux-injectable-reducer';

const store = configureStore();

const countReducer = (state = 0, action) => {
  if (action.type === 'INCREMENT') return state + 1;
  return state;
};

class App extends Component {
  store = this.props.store;

  componentWillMount() {
    this.store.inject({ count: countReducer });
  }

  componentDidMount() {
    this.unsubscribe = this.store.subscribe(() => {
      this.forceUpdate();
    });

    this.interval = setInterval(() => {
      this.store.dispatch({ type: 'INCREMENT' });
    }, 1000);
  }

  componentWillUnmount() {
    this.unsubscribe();
    clearInterval(this.interval);
  }

  render() {
    const { count } = this.store.getState();
    return <span>{count}</span>;
  }
}

ReactDOM.render(
  <App store={store} />,
  document.getElementById('root')
);
```

## Action Buffering

When injecting reducers, a `BUFFER` action is dispatched to the store. This marks a place in the history for the root reducer to start buffering events for injected reducers to handle. This is useful for server side rendering where your client store would be created with initial state from the server store. Since reducers are injected lazily, you would want actions to be put into a buffer for reducers that were injected to the server store. Once the reducer is injected to the client store, the buffer is flushed and handled by the respective reducer.


## API

### configureStore([preloadedState], [enhancer]) => store

`configureStore` is a wrapper around `createStore` from `redux`. `preloadedState` and `enhancer` act the same as the `createStore` api. See the [redux docs](https://github.com/reactjs/redux/blob/master/docs/api/createStore.md) for more information on `createStore`.

### store#inject(reducers)

The `store` object is the same as the object returned from `createStore` with the addition of the `store#inject` method. This method allows you to extend the state tree by injecting reducers to handle different namespaces on the root state. See the [redux docs](https://github.com/reactjs/redux/blob/master/docs/api/Store.md) for more information on stores.
