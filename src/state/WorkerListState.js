import * as Constants from '../utils/Constants';

const ACTION_SET_WORKERS = "SET_WORKERS";
const ACTION_HANDLE_WORKER_UPDATED = "HANDLE_WORKER_UPDATED";
const ACTION_HANDLE_WORKER_REMOVED = "HANDLE_WORKER_REMOVED";

const initialState = {
  workers: undefined,
  config: Constants.CONFIG
};

// Define plugin actions
export class Actions {
  static setWorkers = (workers) => ({
    type: ACTION_SET_WORKERS,
    workers
  });
  static handleWorkerUpdated = (worker) => ({
    type: ACTION_HANDLE_WORKER_UPDATED,
    worker
  });
  static handleWorkerRemoved = (workerSid) => ({
    type: ACTION_HANDLE_WORKER_REMOVED,
    workerSid
  });
}

// Define how actions influence state
export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_SET_WORKERS:
      return {
        ...state,
        workers: action.workers,
      };
    case ACTION_HANDLE_WORKER_UPDATED:
      //Remove old worker
      let updatedWorkers = state.workers.filter(worker => worker.worker_sid !== action.worker.worker_sid)
      //Add new worker
      updatedWorkers.push(action.worker);
      return {
        ...state,
        workers: updatedWorkers
      };
    case ACTION_HANDLE_WORKER_REMOVED:
      //Remove old worker
      let newWorkers = state.workers.filter(worker => worker.worker_sid !== action.workerSid)
      return {
        ...state,
        workers: newWorkers
      };
    default:
      return state;
  }

};
