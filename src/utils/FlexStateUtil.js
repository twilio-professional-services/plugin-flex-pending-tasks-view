import { Actions, Manager } from '@twilio/flex-ui';
import { SidPrefixes } from './enums';

/**
 * This was adopted from another plugin repo - so isn't used yet, but seems useful in
 * future
 */
class FlexStateUtil {
  static manager = Manager.getInstance();

  static baseUrl = `https://${this.manager.serviceConfiguration.runtime_domain}`;

  static get flexState() { return this.manager.store.getState().flex; }

  static get userToken() { return this.flexState.session.ssoTokenPayload.token; }

  static setComponentState = (name, state) => {
    Actions.invokeAction('SetComponentState', { name, state });
  }

  
  static getInsightsQueueName = (sid) => new Promise((resolve) => {
    const sidPrefix = sid && sid.slice(0, 2);
    if (sidPrefix !== SidPrefixes.queue) {
      resolve(undefined);
      return;
    }
    this.manager.insightsClient.instantQuery('tr-queue')
      .then(query => {
        query.on('searchResult', items => {
          const queue = items[sid];
          resolve(queue && queue.queue_name);
        });
        query.search('');
      });
  })

  static getInsightsWorkerName = (sid) => new Promise((resolve) => {
    const sidPrefix = sid && sid.slice(0, 2);
    if (sidPrefix !== SidPrefixes.worker) {
      resolve(undefined);
      return;
    }
    this.manager.insightsClient.instantQuery('tr-worker')
      .then(query => {
        query.on('searchResult', items => {
          const worker = items[sid];
          resolve(worker && worker.friendly_name);
        });
        query.search('');
      });
  })
}

export default FlexStateUtil;
