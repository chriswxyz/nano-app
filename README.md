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
    app.dispatch({ type: '@myApp/ONE_CLICKED' });
}

function twoClicked(){
    app.dispatch({ type: '@myApp/TWO_CLICKED' });
}

const actions = {
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
    actions,
    reducer: Reducer,
    component: Root
}

const app = NanoApp(args);
```