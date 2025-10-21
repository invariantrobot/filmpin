import { runInAction } from 'mobx';

export function resolvePromise(prms, promiseState) {
  promiseState.promise = prms;
  runInAction(() => {
    promiseState.data = null;
    promiseState.error = null;
  });

  function successACB(result) {
    if (promiseState.promise === prms) {
      runInAction(() => {
        promiseState.data = result;
      });
    }
  }

  function failureACB(someError) {
    runInAction(() => {
      promiseState.error = someError;
    });
  }

  if (promiseState.promise) {
    prms.then(successACB).catch(failureACB);
  }
}
