import reducer from '../../src/reducer';
import offlineMiddleware from '../../src/offlineMiddleware';
import suspendSaga from '../../src/suspendSaga';
import { createStore, applyMiddleware, combineReducers } from 'redux'
import consumeActionMiddleware from '../../src/consumeActionMiddleware';

export function wholePipeline(preloadState, config = {}) {

    const gotToReducerSpy = jest.fn();
    const sagaMiddlewareSpy = jest.fn();
    const store = createStore(
        combineReducers({
            offline: reducer(config)
        }),
        preloadState,
        applyMiddleware
            (
                offlineMiddleware(config),
                suspendSaga(
                    store => next => action => {
                        sagaMiddlewareSpy(action);
                        return next(action)
                    },
                    config
                ),

                consumeActionMiddleware(),
                store => next => action => {
                    gotToReducerSpy(action)
                    return next(action)
                }
            )
    );

    return {
        store,
        dispatchSpy: jest.spyOn(store, 'dispatch'),
        gotToReducerSpy,
        sagaMiddlewareSpy
    }
}

