import { Manager } from "@twilio/flex-ui";
import { Actions } from './QueueSummaryState';

/**
 * LiveQuery implementation.
 * Preference is to use this instead of QueueSummaryService - which uses InstantQuery
 * LiveQuery subscribes to the search and receives updates - without requiring polling requests
 * This is much safer for mitigating against rate-limiting, and also brings real-time update benefits! 
 */
export class QueueSummaryListener {

  _queuesLiveQuery = undefined;
  _tasksLiveQueries = new Map(); // Map queue_sid to filtered task LiveQuery

  static create() {
    return new QueueSummaryListener();
  }

  constructor() {
  }


  unsubscribe() {
    this._unsubscribeQueuesLiveQuery();
    this._unsubscribeTasksLiveQueries();
  }

  _unsubscribeQueuesLiveQuery() {
    if (this._queuesLiveQuery) {
        this._queuesLiveQuery.removeAllListeners();
        this._queuesLiveQuery.close();
        this._queuesLiveQuery = undefined;
    }
  }  

  _unsubscribeTasksLiveQueries() {
    if (this._tasksLiveQueries && this._tasksLiveQueries.size > 0) {
      Object.keys(this._tasksLiveQueries).forEach(queueSid => {
        this._unsubscribeTaskLiveQuery(this._tasksLiveQueries[queueSid]);
      });
      this._tasksLiveQueries = new Map();
    }
  }  

  _unsubscribeTasksLiveQuery(tasksLiveQuery) {
    if (tasksLiveQuery) {
        tasksLiveQuery.removeAllListeners();
        tasksLiveQuery.close();
        tasksLiveQuery = undefined;
    }
  }  

  queuesSearch(selectedQueues) {
    // See Flex-Monorepo SupervisorWorkerListener for inspiration
    this._subscribeQueuesLiveQuery(selectedQueues);
  }

  _subscribeQueuesLiveQuery(selectedQueues) {
    Manager
      .getInstance()
      .insightsClient
      .liveQuery("tr-queue", QueueSummaryListener._constructQueueQuery(selectedQueues))
      .then((q) => {

        this._queuesLiveQuery = q;
        this._updateStateQueues(q.getItems());

        q.on('itemRemoved', (item) => {
          this._onQueueItemRemoved(item);
        });
        q.on('itemUpdated', (item) => {
          this._onQueueItemUpdated(item);
        });
      })
      .catch(function (e) {
        console.error('Error when subscribing to live updates on queue search', e);
      });
  }

  _onQueueItemUpdated(queueItem) {
    // Don't really care yet about queues changing in real-time, so just log it
    console.warn(`Queue item was updated, and we have no logic to handle it: ${JSON.stringify(queueItem)}`);
    // TODO: Add logic to deal with this
  }

  _onQueueItemRemoved(queueItem) {
    // Don't really care yet about queues changing in real-time, so just log it
    console.warn(`Queue item removed, and we have no logic to handle it: ${JSON.stringify(queueItem)}`);
    // TODO: Add logic to deal with this
  }
  
  
  
  _updateStateQueues(insightsQueues) {
    const queueResults = Object.keys(insightsQueues).map(queueSid => {
      const queueResult = insightsQueues[queueSid];
      // Go get the tasks
      this._tasksSearch(queueResult);
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
  
  
  _tasksSearch(queue) {
    this._subscribeTasksLiveQuery(queue);
  };
  

  _subscribeTasksLiveQuery(queue) {
    Manager
      .getInstance()
      .insightsClient
      .liveQuery("tr-task", QueueSummaryListener._constructTaskQuery(queue))
      .then((q) => {

        this._tasksLiveQueries.set(queue.sid, q);
        this._updateStateTasksForQueue(queue, q.getItems());

        q.on('itemRemoved', (item) => {
          console.debug(`Queue task item removed: SID: ${item.key} | Queue: ${queue.queue_name}`);
          this._onQueueTaskItemRemoved(queue.queue_sid, item);
        });
        q.on('itemUpdated', (item) => {
          console.debug(`Queue task item updated: SID: ${JSON.stringify(item.value.task_sid)} | Queue: ${queue.queue_name}`);
          this._onQueueTaskItemUpdated(item);
        });
      })
      .catch(function (e) {
        console.error('Error when subscribing to live updates on task search', e);
      });
  }

  _onQueueTaskItemUpdated(taskItem) {
    const task = taskItem.value;
    // We need to find the queue this task resides in, then update/add the task within our state
    Manager.getInstance().store.dispatch(Actions.handleTaskUpdated(task));

  }

  _onQueueTaskItemRemoved(queueSid, taskItem) {
    // We need to find the queue this task resides in, then remove the task from our state
    Manager.getInstance().store.dispatch(Actions.handleTaskRemoved(queueSid, taskItem.key));
  }

  _updateStateTasksForQueue(queue, insightsTasks) {
    const tasks = Object.keys(insightsTasks)
      .map(taskSid => insightsTasks[taskSid])
      .sort((a, b) => new Date(a.date_created) - new Date(b.date_created));
    // Must use proper action and reducer to update Redux store
    console.debug(`${tasks.length} tr-task results for queue: ${queue.queue_name}`);
    Manager.getInstance().store.dispatch(Actions.setQueueTasks(queue.queue_sid, tasks));
    //tasks.length > 0 && console.debug(JSON.stringify(tasks));
    
  };
  
  static _constructTaskQuery(queue) {
    return `data.queue_name == "${queue.queue_name}" AND data.status == "pending"`;
  };
}

