# Flex Pending Tasks View

This plugin introduces a new Flex tab/SideNav to allow supervisors and admins to visualize all tasks that are waiting in queues, with totals and max age. It differs from the [Real-Time Queues View](https://www.twilio.com/docs/flex/end-user-guide/insights/real-time-queues-view) in that: 

1. You can configure the screen to breakdown the number of tasks based on specific task attributes that are important to you. e.g. show me all the pending task totals broken down by the different `language` attribute values.
2. You can drill into the list of pending tasks within each queue, and present specific task attributes that are meaningful to your solution. e.g. in addition to the Twilio Task SID, you might include your own internal identifier (if it's available as a task attribute) 

This gives a level of granularity beyond what the [Real-Time Queues View](https://www.twilio.com/docs/flex/end-user-guide/insights/real-time-queues-view) offers today.

## Known Limitations
The plugin makes use of the [Flex InsightsClient](https://www.twilio.com/docs/flex/developer/ui/manager#insightsclient) to query the pre-existing `tr-queue` and `tr-task` indexes. Please note that the `InsightsClient` has certain [limits](https://www.twilio.com/docs/sync/limits#sync-insights-client-limits) in place, namely:

1. A maximum of 200 results can be returned by any one query (so if you have more than 200 queues, or more than 200 pending tasks on any queue, you'll need to introduce additional filtering to the plugin)
2. Sync enforces concurrency limits of 20 reads per second, per object (so if you have lots of queues and/or lots of supervisors concurrently running the plugin, you could potentially run into issues)


## Plugin Configuration
You can customize the Pending Tasks View by modifying the `CONFIG` object in the file, `src/utils/Constants.js`. e.g.

```json
export const CONFIG = {
  useLiveQuery: true, // Determines whether to query once and subscribe to updates, or poll using the same query repeatedly
  pollFrequencyInMillis: 30000, // Applicable only if useLiveQuery is false
  queueTaskColumns: ['myRelevantTaskAttribute', 'someOtherTaskAttribute'], // Used to break down the totals at the queue level
  taskAttributeColumns: ['myInternalCustomerIdentifierAttribute', 'myRelevantTaskAttribute'], // Used to present the list of tasks
};
```


## About Twilio Flex Plugins

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com). We support Node >= 10.12 (and recommend the _even_ versions of Node). Afterwards, install the dependencies by running `npm install`:

```bash
cd 

# If you use npm
npm install
```

Next, please install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) by running:

```bash
brew tap twilio/brew && brew install twilio
```

Finally, install the [Flex Plugin extension](https://github.com/twilio-labs/plugin-flex/tree/v1-beta) for the Twilio CLI:

```bash
twilio plugins:install @twilio-labs/plugin-flex@beta
```

## Development

In order to develop locally, you can use the Webpack Dev Server by running (from the root plugin directory):

```bash
Twilio flex:plugins:start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. If you want to change that you can do this by setting the `PORT` environment variable:

When you make changes to your code, the browser window will be automatically refreshed.

## Deploy

When you are ready to deploy your plugin, in your terminal run:
```
Run: 
twilio flex:plugins:deploy --major --changelog "Notes for this version" --description "Functionality of the plugin"
```
For more details on deploying your plugin, refer to the [deploying your plugin guide](https://www.twilio.com/docs/flex/plugins#deploying-your-plugin).

