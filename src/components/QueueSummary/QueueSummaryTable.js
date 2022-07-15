import React from "react";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import QueueSummaryRow from "./QueueSummaryRow";
import * as Constants from '../../utils/Constants';

const QueueSummaryTable = (props) => (
  <Table aria-label="simple table">
    <TableHead>
      <TableRow>
        <TableCell />
        <TableCell>Queue</TableCell>
        <TableCell>Tasks</TableCell>
        {props.config[Constants.CONFIG_QUEUE_TASK_COLUMNS] && Object.values(props.config[Constants.CONFIG_QUEUE_TASK_COLUMNS]).map((column) => (
          <TableCell key={column}>{column}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {props.queues && Object.values(props.queues).sort(compareQueues).map((queue) => (
        <QueueSummaryRow key={queue.queue_sid} queue={queue} config={props.config} />
      ))}
    </TableBody>
  </Table>
);

const compareQueues = (a, b) => {
  if (a.queue_name < b.queue_name) {
    return -1;
  } else if (a.queue_name > b.queue_name) {
    return 1;
  } else {
    return 0;
  }
}

export default QueueSummaryTable;