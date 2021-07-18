import * as React from 'react';
import { connect } from 'react-redux';
import { Actions, withTheme, Manager } from '@twilio/flex-ui';
import { namespace } from '../../state';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { WorkerListener } from '../../state/WorkerListener';

const manager = Manager.getInstance();
const DefaultValue = 'WORKER';
class AssignTaskDialog extends React.Component {
  workerListener = undefined;

  constructor(props) {
    super(props);
    this.workerListener = WorkerListener.create();
  }

  state = {
    //Selected worker short name
    selectedWorker: DefaultValue
  }

  componentDidMount() {
    this.workerListener.workersSearch();
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    this.workerListener.unsubscribe();
  }



  handleClose = () => {
    this.closeDialog();
  }

  closeDialog = () => {
    Actions.invokeAction('SetComponentState', {
      name: 'AssignTaskDialog',
      state: { isOpen: false, taskSid: undefined }
    });
  }


  handleChange = e => {
    const value = e.target.value;
    console.log('Selected Worker: ', value);
    this.setState({ selectedWorker: value });
  }

  handleAssignTask = async () => {
    const workerName = this.state.selectedWorker;
    const taskSid = this.props.taskSid;
    //Only update if worker selected
    if (workerName && workerName !== DefaultValue) {
      //Worker contact_uri = "client:<name>"
      const workerContactUri = "client:" + workerName;
      console.log('UPDATING TASK:', taskSid);

      const fetchUrl = `${process.env.REACT_APP_SERVICE_BASE_URL}/update-task`;

      const fetchBody = {
        Token: manager.store.getState().flex.session.ssoTokenPayload.token,
        taskSid,
        workerContactUri
      };
      const fetchOptions = {
        method: 'POST',
        body: new URLSearchParams(fetchBody),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      };

      try {
        const response = await fetch(fetchUrl, fetchOptions);
        await response.json();
        console.debug('Task Updated');
      } catch (error) {
        console.error('Task Update Failed', error);
      }
      //clear state
      this.setState({ selectedWorker: DefaultValue });
      this.closeDialog();
    }

  }


  render() {
    return (
      <Dialog
        open={this.props.isOpen || false}
        onClose={this.handleClose}
      >
        <DialogContent>
        <DialogContentText>
            Task: {this.props.taskSid}
          </DialogContentText>
          <DialogContentText>
            Available Workers:
          </DialogContentText>
          <Select
            value={this.state.selectedWorker}
            onChange={this.handleChange}
            name="worker"
          >
            <MenuItem value={DefaultValue}>SELECT WORKER</MenuItem>
            {this.props.workers.map((worker) => (
              <MenuItem
                key={worker.friendly_name}
                value={worker.friendly_name}
              > {worker.friendly_name}
              </MenuItem>
            ))}

          </Select>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.handleAssignTask}
            color="primary"
          >
            Assign Task
          </Button>

        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  const componentViewStates = state.flex.view.componentViewStates;
  const assignTaskDialogState = componentViewStates && componentViewStates.AssignTaskDialog;
  const isOpen = assignTaskDialogState && assignTaskDialogState.isOpen;
  const taskSid = assignTaskDialogState && assignTaskDialogState.taskSid;
  return {
    isOpen,
    taskSid,
    workers: state?.[namespace].workerList.workers || []
  };
};

export default connect(mapStateToProps)(withTheme(AssignTaskDialog));