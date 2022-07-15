import { Manager } from "@twilio/flex-ui";
import { Actions } from './QueueSummaryState';

/**
 * InstantQuery implementation (requires polling).
 * Preference is to use QueueSummaryListener - which uses LiveQuery
 */
export class QueueSummaryService {

  static _isInitialized = false;

  static init(selectedQueues) {

    if (this._isInitialized) {
      return;
    }

    QueueSummaryService._queuesSearch(selectedQueues);

    this._initialized = true;
  }

  static refresh(selectedQueues) {
    if (!QueueSummaryService._isInitialized) {
      QueueSummaryService._queuesSearch(selectedQueues);
    }
  }

  static close() {
    QueueSummaryService._isInitialized = false;
  }

  static _queuesSearch(selectedQueues) {
    Manager.getInstance()
      .insightsClient.instantQuery("tr-queue")
      .then((q) => {
        q.on("searchResult", this._setQueueList);
        q.search(QueueSummaryService._constructQueueQuery(selectedQueues));
      });
  };


  
  
  static _setQueueList(insightsQueues) {
    const queueResults = Object.keys(insightsQueues).map(queueSid => {
      const queueResult = insightsQueues[queueSid];
      // Go get the tasks
      QueueSummaryService._tasksSearch(queueResult);
      return queueResult;
    });
    Manager.getInstance().store.dispatch(Actions.setQueues(queueResults));
  
    console.debug(`${queueResults.length} tr-queue results`);
  };
  
  
  
  static _constructQueueQuery(selectedQueues) {
    if (selectedQueues) {
      return `data.queue_name IN ${JSON.stringify(selectedQueues)}`
    } else {
      return ''; // Get all queues for now
    }
  };
  
  
  static _tasksSearch(queue) {
    Manager.getInstance()
      .insightsClient.instantQuery("tr-task")
      .then((q) => {
        q.on("searchResult", (result) => this._setTaskList(queue, result));
        q.search(QueueSummaryService._constructTaskQuery(queue));
      });
  };
  
  
  static _setTaskList(queue, insightsTasks) {
    const tasks = Object.keys(insightsTasks)
      .map(taskSid => insightsTasks[taskSid])
      .sort((a, b) => new Date(a.date_created) - new Date(b.date_created));
    // Must use proper action and reducer to update Redux store
    console.debug(`${tasks.length} tr-task results for queue: ${queue.queue_name}`);
    Manager.getInstance().store.dispatch(Actions.setQueueTasks(queue.queue_sid, tasks));
    //tasks.length > 0 && console.debug(JSON.stringify(tasks));
    
  };
  
  static _constructTaskQuery(queue) {
    return `data.queue_name == "${queue.queue_name}"`;// AND data.status == "pending"`;
  };
}

