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

import { Utils } from '@twilio/flex-ui';

import * as Constants from '../../utils/Constants';

const styles = {
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  }
};

class QueueSummaryRow extends React.Component  {


  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
  }

  onToggleOpen = (open) => {
    this.setState(() => ({ open }));
  }

  render() {
    const { queue, config, columns, classes } = this.props;
    


    return (
      <React.Fragment>
        <TableRow key={queue.queue_sid} className={classes.root}>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => this.onToggleOpen(!this.state.open)}>
              {this.state.open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>    
          <TableCell component="th" scope="row">
            {queue.queue_name}
          </TableCell>
          <TableCell>{queue.tasks ? queue.tasks.length : 0}</TableCell>  
          {this.renderQueueSummaryRowColumnData(queue, config[Constants.CONFIG_QUEUE_TASK_COLUMNS])}
        </TableRow>
        <TableRow key={queue.queue_sid + '_tasks'}>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
            <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                <Typography variant="h6" gutterBottom component="div">
                  Tasks
                </Typography>
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
      <Table size="small" aria-label="tasks">
        <TableHead>
          <TableRow>
            <TableCell>Age</TableCell>
            <TableCell>SID</TableCell>
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
    );
  }

  renderTasksTableRow(task, taskAttributeColumns) {
    return (
      <TableRow key={task.task_sid}>
        <TableCell component="th" scope="row">
          {Utils.formatTimeDuration(new Date() - new Date(task.date_created), "short")}
        </TableCell>
        <TableCell>{task.task_sid}</TableCell>
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