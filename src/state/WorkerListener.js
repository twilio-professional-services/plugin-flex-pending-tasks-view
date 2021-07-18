import { Manager } from "@twilio/flex-ui";
import { Actions } from './WorkerListState';

/**
 * LiveQuery implementation.
 * LiveQuery subscribes to the search and receives updates
 */
export class WorkerListener {
  _WorkersLiveQuery = undefined;
  
  static create() {
    return new WorkerListener();
  }

  constructor() {
  }


  unsubscribe() {
    this._unsubscribeWorkersLiveQuery();
  }

  _unsubscribeWorkersLiveQuery() {
    if (this._WorkersLiveQuery) {
        this._WorkersLiveQuery.removeAllListeners();
        this._WorkersLiveQuery.close();
        this._WorkersLiveQuery = undefined;
    }
  }  

  workersSearch() {
    this._subscribeWorkersLiveQuery();
  }

  _subscribeWorkersLiveQuery() {
    Manager
      .getInstance()
      .insightsClient
      .liveQuery("tr-worker", WorkerListener._constructWorkerQuery())
      .then((q) => {

        this._WorkersLiveQuery = q;
        this._updateStateWorkers(q.getItems());

        q.on('itemRemoved', (item) => {
          this._onWorkerRemoved(item);
        });
        q.on('itemUpdated', (item) => {
          this._onWorkerUpdated(item);
        });
      })
      .catch(function (e) {
        console.log('Error when subscribing to live updates on worker search', e);
      });
  }
  
  _updateStateWorkers(insightsWorkers) {
    const workerList = Object.keys(insightsWorkers).map(workerSid => {
      const workerResult = insightsWorkers[workerSid];
      return workerResult;
    });
    Manager.getInstance().store.dispatch(Actions.setWorkers(workerList));
  
    console.debug(`${workerList.length} tr-worker results`);
  };
  
  static _constructWorkerQuery() {
    //Only get available workers
    // Other search criteria?
    return `data.activity_name == "Available"`;
  };
  
  _onWorkerUpdated(workerItem) {
    // insights query item contains { key: <sid>, value: <worker obj>}
    const worker = workerItem.value;
    console.log(`Worker updated: ${workerItem.key}`);
    //Update worker in our state
    Manager.getInstance().store.dispatch(Actions.handleWorkerUpdated(worker));
  }

  _onWorkerRemoved(workerItem) {
    console.log(`Worker removed: ${workerItem.key}`);
    //Remove worker from our state
    Manager.getInstance().store.dispatch(Actions.handleWorkerRemoved(workerItem.key));
  }
  
}

