# redux-extendable-reducer

Redux reducer capable of lazily extending itself. Useful for large single page applications that utilize bundle splitting.

*NOTE: formally redux-injectable-reducer*

## Install

```
npm install --save redux redux-extendable-reducer
```

## Usage

```js
import { createStore } from 'redux';
import rootReducer, { extendReducer } from 'redux-extendable-reducer';

const countReducer = (state = 0, action) => {
  if (action.type === 'INCREMENT_COUNT') return state + 1;
  return state;
};

const incrementCount = () => ({ type: 'INCREMENT_COUNT' });

const store = createStore(rootReducer);

store.dispatch(incrementCount());

console.log(store.getState().count); // undefined

store.dispatch(extendReducer({ count: countReducer }));

console.log(store.getState().count); // 0

store.dispatch(incrementCount());

console.log(store.getState().count); // 1
```

### with React

```js
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { createStore } from 'redux';
import rootReducer, { extendReducer } from 'redux-extendable-reducer';

const countReducer = (state = 0, action) => {
  if (action.type === 'INCREMENT_COUNT') return state + 1;
  return state;
};

const incrementCount = () => ({ type: 'INCREMENT_COUNT' });

class App extends Component {
  static propTypes = {
    count: PropTypes.number,
    extendReducer: PropTypes.func.isRequired,
    incrementCount: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.props.extendReducer({ count: countReducer });
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.props.incrementCount();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return <span>{this.props.count}</span>;
  }
}

const ConnectedApp = connect(
  state => ({ count: state.count }),
  { extendReducer }
)(App);

const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
);
```

## Action Buffering

When the root reducer is extended, a buffer is created for each namespace that is introduced. This marks a place in the history for the root reducer to start buffering actions for a given namespace. This is useful for server side rendering where your client store would be created with initial state from the server store. Since the root reducer is extended lazily, you would want actions to be put into a buffer for each namespace that was introduced to the server store. Once the root reducer is extended in the client store, the buffer for each namespace is flushed and handled by the respective namespace reducer.
