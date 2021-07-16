export const MAX_INSIGHTS_CLIENT_RESULTS = 200;
export const DEFAULT_POLL_FREQUENCY_IN_MILLIS = 5000;



export const CONFIG_QUEUE_TASK_COLUMNS = 'queueTaskColumns';
export const CONFIG_QUEUE_WORKER_COLUMNS = 'queueWorkerColumns';
export const CONFIG_TASK_ATTRIBUTE_COLUMNS = 'taskAttributeColumns';
export const CONFIG_POLL_FREQUENCY = 'pollFrequencyInMillis';

// TODO: Put this in external config
export const CONFIG = {
  useLiveQuery: true, // Determines whether to query once and subscribe to updates, or poll using the same query repeatedly
  pollFrequencyInMillis: 30000, // Applicable only if useLiveQuery is false
  queueTaskColumns: ['accountValue', 'language'], // Used to break down the totals at the queue level
  taskAttributeColumns: ['accountValue', 'language'], // Used to present the list of tasks
};

