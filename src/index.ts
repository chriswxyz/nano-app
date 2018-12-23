/** Make a new app */
export function NanoApp<TState, TAction extends { type: TAction['type'] }>(args: NanoAppArgs<TState, TAction>) {
    const {
        initialState,
        component,
        reducer,
        actionCreators,
        windowObject = window,
        element = document.body,
        windowProp = 'nano',
        debugProp = 'nano_d'
    } = args;

    /** Keeps track of the current state */
    let currentState = initialState;

    /** All the past states and transitions of the app */
    let stateCounter = 0;
    const stateHistory: TState[] = [];
    const actionHistory: TAction[] = [];

    record(stateCounter, currentState);
    devtools(`State (${stateCounter})`, currentState);

    /** Given a state, render the app into the host element */
    function render(state: TState) { element.innerHTML = component(state); }

    /** Dispatch an action, update the state, rerender and log some debug data */
    function dispatch(action: TAction) {
        devtools(action.type, action);
        try {
            // Get the next state given the dispatched action
            // Clone the original state so the reducer can't mutate it
            currentState = reducer(clone(currentState), action);
            // Render the new state
            render(currentState);
            stateCounter += 1;
            record(stateCounter, currentState, action);
            devtools(`State (${stateCounter})`, currentState);
        } catch (e) {
            deverror(`Error in dispatch`, e);
        }
    }

    // Connected actions take the result of an action creator (object or thunk)
    // and call the dispatch function (if an object) or call the thunk.
    const connectedActions = connect(actionCreators, dispatch, () => clone(currentState));
    windowObject[windowProp] = connectedActions

    // Time travel debugging is available by recording each state of the app.
    /** Record the current state and action in history. */
    function record(index: number, state: TState, action?: TAction) {
        stateHistory[index] = state;
        if (action) { actionHistory[index] = action; }
    }

    /** Rewind to a particular state. */
    function rewind(index?: number) {
        index = typeof (index) === "undefined"
            ? (stateHistory.length - 1)
            : index;

        const pastState = stateHistory[index];

        if (pastState) {
            // Reset the state and action counter
            currentState = pastState;
            stateCounter = index;
            devtools(`📼 Rewinding to state ${index}`, currentState);
            render(currentState);
        } else {
            deverror(`🤔 No history for state ${index}`, stateHistory);
        }
    }

    windowObject[debugProp] = { rewind };

    // Render the app.
    render(initialState);

    return { poweredBy: '🍺' };
}

/**
 * Caller provided action creators will return an object
 * which can be immediately dispatched, or a thunk, which
 * needs our dispatcher and state provided.
 */
function connect<TState, TAction extends { type: TAction['type']; }>(
    actions: Dict<ActionCreator<TState, TAction>>,
    dispatch: (action: TAction) => void,
    getState: () => TState) {
    const dispatchingActions: Dict<(...args: any[]) => void> = {};
    for (const prop in actions) {
        const actionCreator = actions[prop];
        const nextAction = (...args: any[]) => {
            const intermediate = actionCreator(...args);
            if (typeof intermediate === 'function') {
                intermediate(dispatch, getState);
                return;
            }
            dispatch(intermediate);
        };
        dispatchingActions[prop] = nextAction;
    }
    return dispatchingActions;
}

/** Log an item in a console group */
function devtools(title: string, obj: any) {
    console.group(title);
    console.log(obj);
    console.groupEnd();
}

/** Log an error in a console group */
function deverror(title: string, obj: any) {
    console.group(`❌ ${title}`);
    console.error(obj);
    console.groupEnd();
}

/** Clone an object */
function clone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)) as T; }

// Just types below here.
type Dict<T> = { [idx: string]: T }
export interface NanoElement { innerHTML: string; }
type Dispatch<TAction> = (action: TAction) => void;
type Thunk<TState, TAction> = (dispatch: Dispatch<TAction>, getstate: () => TState) => void;
type SyncActionCreator<TAction> = (...args: any[]) => TAction;
type AsyncActionCreator<TState, TAction> = (...args: any[]) => Thunk<TState, TAction>;
type ActionCreator<TState, TAction> = SyncActionCreator<TAction> | AsyncActionCreator<TState, TAction>;

export interface NanoAppArgs<TState, TAction> {
    /** The initial state of the app. */
    initialState: TState;
    /** The root component. */
    component: (state: TState) => string;
    /** The state reducer. */
    reducer: (state: TState, action: TAction) => TState;
    /** Functions to create actions. */
    actionCreators: Dict<ActionCreator<TState, TAction>>;
    /** Element to render the app in. Defaults to document.body.*/
    element?: NanoElement;
    /** The window object. Defaults to window. */
    windowObject?: any;
    /** The window prop to namespace actions. Defaults to 'nano' */
    windowProp?: string;
    /** The window prop to namespace debug functions. Defaults to 'nano_d' */
    debugProp?: string;
}
