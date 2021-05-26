import { combineReducers } from 'redux';
import { reduce as queueSummaryReducer } from './QueueSummaryState';


// Register your redux store under a unique namespace
export const namespace = 'flex-queue-summary';

// Combine the reducers
export default combineReducers({
  queueSummary: queueSummaryReducer
});