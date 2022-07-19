import React from "react";
import { connect } from 'react-redux';

import { withTheme } from "@twilio/flex-ui";
import { namespace } from '../../state';


import QueueSummaryTable from "./QueueSummaryTable";
import { QueueSummaryTableContainer } from './QueueSummaryView.Components';
import { QueueSummaryService } from '../../state/QueueSummaryService';
import { QueueSummaryListener } from '../../state/QueueSummaryListener';
import { CONFIG, DEFAULT_POLL_FREQUENCY_IN_MILLIS } from "../../utils/Constants";


class QueueSummaryView extends React.Component {

  queueSummaryListener = undefined;
  refreshTimer = undefined;

  constructor(props) {
    super(props);
    if (CONFIG.useLiveQuery) {
      this.queueSummaryListener = QueueSummaryListener.create();
    }
  }




  componentDidMount() {
    //Only need timer if not using LiveQuery/QueueSummaryListener
    if (!CONFIG.useLiveQuery) {
      QueueSummaryService.init(this.props.selectedQueues);
      this.refreshTimer = window.setInterval(() => {
        QueueSummaryService.refresh(this.props.selectedQueues);
      }, 
      CONFIG.pollFrequencyInMillis ? CONFIG.pollFrequencyInMillis : DEFAULT_POLL_FREQUENCY_IN_MILLIS);
    } else {
      this.queueSummaryListener.queuesSearch(this.props.selectedQueues);
    }
  }

  componentDidUpdate() {
    // TODO: React to the queue filters changing!
  }

  componentWillUnmount() {
    if (!CONFIG.useLiveQuery) {
      if (this.refreshTimer !== undefined) {
        window.clearInterval(this.refreshTimer);
      }
      QueueSummaryService.close();
    } else {
      this.queueSummaryListener.unsubscribe();
    }
  }

  render() {
    return (
      <QueueSummaryTableContainer>
        <QueueSummaryTable queues={this.props.queueSummary.queues} config={this.props.queueSummary.config} />
      </QueueSummaryTableContainer>
    );
  }
}

const mapStateToProps = (state) => {
  const customReduxStore = state?.[namespace];
  // Honor any filters applied via Queue Stats UI
  // TODO: Replicate selector component from https://github.com/twilio-professional-services/plugin-queues-view-filters
  let selectedQueues = state['flex'].worker.attributes['queues_view_filters']; 

  return {
    queueSummary: customReduxStore.queueSummary,
    selectedQueues
  }
}



export default connect(mapStateToProps)(withTheme(QueueSummaryView));