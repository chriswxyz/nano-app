# nano-app
The very very very small app library

## Usage
```js
import { NanoApp } from '@chriswxyz/nano-app';

// Define a UI Model

const initialState = {
    greeting: 'world';
};

// Define actions

function oneClicked(){
    return { type: '@myApp/ONE_CLICKED' };
}

function twoClicked(){
    return { type: '@myApp/TWO_CLICKED' };
}

const actionCreators = {
    oneClicked,
    twoClicked
};

// Define state changes

function Reducer(state, action){
    switch(action.type){
        case '@myApp/ONE_CLICKED': {
            return {
                greeting: 'nano'
            }
        }
        case '@myApp/TWO_CLICKED': {
            return {
                greeting: 'internet'
            }
        }
    }

    return state;
}

// Define views

function Root(state){
    return `<div>
        <div>Hello, ${state.greeting}</div>
        <button onClick='nano.oneClicked()'>1</button>
        <button onClick='nano.twoClicked()'>2</button>
    </div>`;
}

// Run the app

const args = {
    initialState,
    actionCreators,
    reducer: Reducer,
    component: Root
}

const app = NanoApp(args);
```

## Args
```js
const args = {
    initialState,
    actionCreators,
    reducer,
    component,

    // A window-like object to write action creators and debug functions to.
    // defaults to "window"
    windowObject: { }, 

    // Prop on window where the caller defined action creators exist.
    // ex window.nano.foo1()
    // defaults to "nano"
    windowProp: 'my_namespace',

    // An element-like object to write the rendered output of the root component.
    // defaults to document.body
    element: document.querySelector('main'),

    // Prop on window where debug functions exist.
    // defaults to "nano_d"
    debugProp: 'my_debug_namespace'
}
```