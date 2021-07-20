import React from "react";
import { VERSION, SideLink, Actions } from "@twilio/flex-ui";
import { FlexPlugin } from "flex-plugin";


// My imports
import reducers, { namespace } from "./state";
import { ContextUtil } from "./utils/ContextUtil";
import QueueSummaryView from "./components/QueueSummary";
const PLUGIN_NAME = "FlexTasksTabWithFiltersPlugin";
import AssignTaskDialog from "./components/AssignTaskDialog/AssignTaskDialog";

export default class FlexPendingTasksViewPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {

    this.registerReducers(manager);

    // If supervisor or admin role is found, good to go!
    if (ContextUtil.showSupervisor()) {
      flex.ViewCollection.Content.add(
        <flex.View name="QueueSummaryView" key="queueSummaryView">
          <QueueSummaryView />
        </flex.View>
      );

      flex.SideNav.Content.add(
        <SideLink
          key="tasksSideLink"
          icon="GenericTask"
          iconActive="GenericTaskBold"
          onClick={() =>
            Actions.invokeAction("NavigateToView", { viewName: "QueueSummaryView" })
          }
        >
          Pending Tasks
        </SideLink>,
        { sortOrder: 2 }
      );

      flex.SideNav.Content.add(<AssignTaskDialog
        key="assign-task-modal"
      />, { sortOrder: 100 });
    }
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`
      );
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }


}
