/** Make a new app */
export function NanoApp(args) {
    var initialState = args.initialState, component = args.component, reducer = args.reducer, actionCreators = args.actionCreators, _a = args.windowObject, windowObject = _a === void 0 ? window : _a, _b = args.element, element = _b === void 0 ? document.body : _b, _c = args.windowProp, windowProp = _c === void 0 ? 'nano' : _c, _d = args.debugProp, debugProp = _d === void 0 ? 'nano_d' : _d;
    /** Keeps track of the current state */
    var currentState = initialState;
    /** All the past states and transitions of the app */
    var stateCounter = 0;
    var stateHistory = [];
    var actionHistory = [];
    record(stateCounter, currentState);
    devtools("State (" + stateCounter + ")", currentState);
    /** Given a state, render the app into the host element */
    function render(state) { element.innerHTML = component(state); }
    /** Dispatch an action, update the state, rerender and log some debug data */
    function dispatch(action) {
        devtools(action.type, action);
        try {
            // Get the next state given the dispatched action
            // Clone the original state so the reducer can't mutate it
            currentState = reducer(clone(currentState), action);
            // Render the new state
            render(currentState);
            stateCounter += 1;
            record(stateCounter, currentState, action);
            devtools("State (" + stateCounter + ")", currentState);
        }
        catch (e) {
            deverror("Error in dispatch", e);
        }
    }
    // Connected actions take the result of an action creator (object or thunk)
    // and call the dispatch function (if an object) or call the thunk.
    var connectedActions = connect(actionCreators, dispatch, function () { return clone(currentState); });
    windowObject[windowProp] = connectedActions;
    // Time travel debugging is available by recording each state of the app.
    /** Record the current state and action in history. */
    function record(index, state, action) {
        stateHistory[index] = state;
        if (action) {
            actionHistory[index] = action;
        }
    }
    /** Rewind to a particular state. */
    function rewind(index) {
        index = typeof (index) === "undefined"
            ? (stateHistory.length - 1)
            : index;
        var pastState = stateHistory[index];
        if (pastState) {
            // Reset the state and action counter
            currentState = pastState;
            stateCounter = index;
            devtools("\uD83D\uDCFC Rewinding to state " + index, currentState);
            render(currentState);
        }
        else {
            deverror("\uD83E\uDD14 No history for state " + index, stateHistory);
        }
    }
    windowObject[debugProp] = { rewind: rewind };
    // Render the app.
    render(initialState);
    return { poweredBy: '🍺' };
}
/**
 * Caller provided action creators will return an object
 * which can be immediately dispatched, or a thunk, which
 * needs our dispatcher and state provided.
 */
function connect(actions, dispatch, getState) {
    var dispatchingActions = {};
    var _loop_1 = function (prop) {
        var actionCreator = actions[prop];
        var nextAction = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var intermediate = actionCreator.apply(void 0, args);
            if (typeof intermediate === 'function') {
                intermediate(dispatch, getState);
                return;
            }
            dispatch(intermediate);
        };
        dispatchingActions[prop] = nextAction;
    };
    for (var prop in actions) {
        _loop_1(prop);
    }
    return dispatchingActions;
}
/** Log an item in a console group */
function devtools(title, obj) {
    console.group(title);
    console.log(obj);
    console.groupEnd();
}
/** Log an error in a console group */
function deverror(title, obj) {
    console.group("\u274C " + title);
    console.error(obj);
    console.groupEnd();
}
/** Clone an object */
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
