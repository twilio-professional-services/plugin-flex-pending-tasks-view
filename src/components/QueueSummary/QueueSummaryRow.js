import React from 'react';
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { StyledButton, TasksTableContainer } from './QueueSummaryView.Components';

import { Actions, Utils } from '@twilio/flex-ui';

import {Actions as QueueSummaryActions } from '../../state/QueueSummaryState';

import { Manager } from '@twilio/flex-ui';
const manager = Manager.getInstance();

import * as Constants from '../../utils/Constants';

const styles = {
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  }
};

class QueueSummaryRow extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
  }

  onToggleOpen = (open) => {
    this.setState(() => ({ open }));
  }

  assignTaskToWorker = (taskSid) => {
    manager.store.dispatch(QueueSummaryActions.setSelectedTask(taskSid));
    console.log('OPEN ASSIGN TASK DIALOG for task:', taskSid);
    Actions.invokeAction('SetComponentState', {
      name: 'AssignTaskDialog',
      state: { isOpen: true }
    });
  }

  render() {
    const { queue, config, columns, classes } = this.props;

    return (
      <React.Fragment>
        <TableRow key={queue.queue_sid} className={classes.root}>
          <TableCell>
            <IconButton onClick={() => this.onToggleOpen(!this.state.open)}>
              {this.state.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>
            {queue.queue_name}
          </TableCell>
          <TableCell>{queue.tasks ? queue.tasks.length : 0}</TableCell>
          {this.renderQueueSummaryRowColumnData(queue, config[Constants.CONFIG_QUEUE_TASK_COLUMNS])}
        </TableRow>
        <TableRow key={queue.queue_sid + '_tasks'}>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
            <Collapse in={this.state.open} timeout="auto" unmountOnExit>
              {this.renderTasksTable(queue.tasks, config[Constants.CONFIG_TASK_ATTRIBUTE_COLUMNS])}
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  renderQueueSummaryRowColumnData(queue, queueTaskColumns) {
    return (
      queueTaskColumns && Object.values(queueTaskColumns).map((column, index) => (
        <TableCell key={column}>
          {queue.columnStats && queue.columnStats[index].size > 0 ?
            [...queue.columnStats[index]].map(([key, stats]) => (
              <div key={key}>{key}: {stats.taskCount} ({(Utils.formatTimeDuration(new Date() - new Date(stats.oldestDateCreated), "short"))})</div>))
            : ''}
        </TableCell>
      ))
    );
  }

  renderTasksTable(tasks, taskAttributeColumns) {
    return (
      <TasksTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Age</TableCell>
              <TableCell>Task SID (Click to Pick)</TableCell>
              {taskAttributeColumns && Object.values(taskAttributeColumns).map((attribute) => (
                <TableCell key={attribute}>{attribute}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks && tasks.map((task) =>
              this.renderTasksTableRow(task, taskAttributeColumns)
            )}
          </TableBody>
        </Table>
      </TasksTableContainer>
    );
  }

  renderTasksTableRow(task, taskAttributeColumns) {
    return (
      <TableRow key={task.task_sid} >
        <TableCell>
          {Utils.formatTimeDuration(new Date() - new Date(task.date_created), "short")}
        </TableCell>
        <TableCell>
          <StyledButton
            onClick={() => {
              this.assignTaskToWorker(task.task_sid);
            }}
          > {task.task_sid.substring(0, 9)}... </StyledButton>
        </TableCell>
        {taskAttributeColumns && Object.values(taskAttributeColumns).map((attribute) => (
          <TableCell key={attribute}>
            {task.attributes && task.attributes[attribute] ? task.attributes[attribute] : ''}
          </TableCell>
        ))}
      </TableRow>
    )
  }
}


export default withStyles(styles)(QueueSummaryRow);