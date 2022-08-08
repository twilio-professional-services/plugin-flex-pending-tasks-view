import { ActionsImpl } from '@twilio/flex-ui';
import * as Constants from '../utils/Constants';

const ACTION_SET_FILTERS = "SET_FILTERS"; // Not used
const ACTION_SET_QUEUES = "SET_QUEUES";
const ACTION_SET_QUEUE_TASKS = "SET_QUEUE_TASKS";
const ACTION_HANDLE_TASK_UPDATED = "HANDLE_TASK_UPDATED";
const ACTION_HANDLE_TASK_REMOVED = "HANDLE_TASK_REMOVED";
const ACTION_SET_SELECTED_QUEUE = "SET_SELECTED_QUEUE"; // Not used
const ACTION_RECALCULATE_FILTERS = "RECALCULATE_FILTERS"; // Not used

const ACTION_SET_SELECTED_TASK = 'SET_SELECTED_TASK';
const ACTION_REMOVE_SELECTED_TASK = 'REMOVE_SELECTED_TASK';


const initialState = {
  filters: [],
  queues: undefined,
  selectedQueueSid: undefined,
  selectedTaskSid: undefined,
  config: Constants.CONFIG
};

// Define plugin actions
export class Actions {
  static setFilters = (filters) => ({
    type: ACTION_SET_FILTERS,
    filters
  });
  static setQueues = (queues) => ({
    type: ACTION_SET_QUEUES,
    queues
  });
  static setQueueTasks = (queueSid, tasks) => ({
    type: ACTION_SET_QUEUE_TASKS,
    payload: {
      queueSid,
      tasks
    }
  });
  static handleTaskUpdated = (task) => ({
    type: ACTION_HANDLE_TASK_UPDATED,
    task
  });
  static handleTaskRemoved = (queueSid, taskSid) => ({
    type: ACTION_HANDLE_TASK_REMOVED,
    payload: {
      queueSid,
      taskSid
    }
  });
  static setSelectedQueue = (selectedQueueSid) => ({
    type: ACTION_SET_SELECTED_QUEUE,
    selectedQueueSid
  });
  static setSelectedTask = (selectedTaskSid) => ({
    type: ACTION_SET_SELECTED_TASK,
    selectedTaskSid
  });
  static removeSelectedTask = () => ({
    type: ACTION_REMOVE_SELECTED_TASK
  });

  static recalculateFilters = () => ({
    type: ACTION_RECALCULATE_FILTERS
  });
}

// Define how actions influence state
export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_SET_FILTERS:
      return {
        ...state,
        filters: action.filters,
      };
    case ACTION_SET_QUEUES:
      return {
        ...state,
        queues: action.queues,
      };
    case ACTION_SET_QUEUE_TASKS:
      return {
        ...state,
        queues: state.queues.map((item, index) => {
          // Update the matching queue
          if (item.queue_sid === action.payload.queueSid) {
            return {
              ...item,
              tasks: action.payload.tasks,
              columnStats: getTaskStatsForColumns(action.payload.tasks, state.config)
            }
          }
          // Non matching queues left untouched
          return item;
        }),
      };
    case ACTION_HANDLE_TASK_UPDATED:
      return {
        ...state,
        queues: state.queues.map(queue => {
          if (queue.queue_name === action.task.queue_name) {
            const copyOfTasks = [...queue.tasks];
            const existingTaskIndex = copyOfTasks.findIndex(t => t.task_sid === action.task.task_sid);
            if (existingTaskIndex < 0) {
              copyOfTasks.push(action.task);
            } else {
              copyOfTasks[existingTaskIndex] = action.task;
            }
            return {
              ...queue,
              tasks: copyOfTasks,
              columnStats: getTaskStatsForColumns(copyOfTasks, state.config)
            }
          }
          return queue;
        }),
      };
    case ACTION_HANDLE_TASK_REMOVED:
      return {
        ...state,
        queues: state.queues.map(queue => {
          if (queue.queue_sid === action.payload.queueSid) {
            const copyOfTasks = [...queue.tasks];
            const existingTaskIndex = copyOfTasks.findIndex(t => t.task_sid === action.payload.taskSid);
            if (existingTaskIndex > -1) {
              copyOfTasks.splice(existingTaskIndex);
            } 
            return {
              ...queue,
              tasks: copyOfTasks,
              columnStats: getTaskStatsForColumns(copyOfTasks, state.config)
            }
          }
          return queue;
        }),
      };
    case ACTION_SET_SELECTED_QUEUE:
      return {
        ...state,
        selectedQueueSid: action.selectedQueueSid,
      };
    case ACTION_SET_SELECTED_TASK:
      return {
        ...state,
        selectedTaskSid: action.selectedTaskSid,
      };
    case ACTION_REMOVE_SELECTED_TASK:
      return {
        ...state,
        selectedTaskSid: undefined,
      };
    case ACTION_RECALCULATE_FILTERS:
      return {
        ...state,
        filters: {
          ...filters
        }
      };
    default:
      return state;
  }

  function getTaskStatsForColumns(tasks, config) {

    const columns = config[Constants.CONFIG_QUEUE_TASK_COLUMNS];

    // Go through columns array, and for each column (task attribute), build up a map of 
    // unique values and their respective stats (e.g. count, max age) - for display
    const columnStats = columns.map((taskAttribute) => {

      let columnStatsMap = new Map();
      // Start with tasks that actually have this attribute.
      // List is already sorted by age, so we know item 1 in any filtered list is the max age :)
      const tasksWithAttribute = tasks.filter((task) => task.attributes[taskAttribute]);
      // Now get the unique values
      const uniqueValues = [...new Set(tasksWithAttribute.map(task => task.attributes[taskAttribute]))];
      // Finally, iterate through each unique value and filter tasks to get count and max age, then 
      // populate map (then sort by highest values)      
      uniqueValues.forEach((taskAttributeValue) => {
        const tasksByAttributeValue = tasksWithAttribute.filter((task) => task.attributes[taskAttribute] === taskAttributeValue);
        const taskCount = tasksByAttributeValue.length;
        const oldestDateCreated = tasksByAttributeValue[0].date_created;
        const stats = {
          taskCount: taskCount,
          oldestDateCreated: oldestDateCreated
        }
        columnStatsMap.set(taskAttributeValue, stats);
      });
      const columnStatsMapDesc = new Map([...columnStatsMap.entries()].sort((a, b) => b.taskCount - a.tasksCount));

      return columnStatsMapDesc;
    });
    return columnStats;
  }
};
