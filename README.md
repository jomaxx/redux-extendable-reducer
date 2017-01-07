# redux-injectable-reducer
Redux store reducer capable of lazily injecting parts of the state tree. Useful for large single page applications that utilize bundle splitting.

## Install
```
npm install --save redux redux-injectable-reducer
```

## Usage

```js
import { createStore } from 'redux';
import { rootReducer, inject } from 'redux-injectable-reducer';

const store = createStore(rootReducer);

store.dispatch({ type: 'INCREMENT' });

console.log(store.getState().count); // undefined

const countReducer = (state = 0, action) => {
  if (action.type === 'INCREMENT') return state + 1;
  return state;
};

store.dispatch(inject({ count: countReducer }));

console.log(store.getState().count); // 0

store.dispatch({ type: 'INCREMENT' });

console.log(store.getState().count); // 1
```

### with React

```js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { rootReducer, inject } from 'redux-injectable-reducer';

const store = createStore(rootReducer);

const countReducer = (state = 0, action) => {
  if (action.type === 'INCREMENT') return state + 1;
  return state;
};

class App extends Component {
  store = this.props.store;

  componentWillMount() {
    this.store.dispatch(inject({ count: countReducer }));
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
