import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { MoreVert } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Slide from '@material-ui/core/Slide';
import { i18nRegister } from '../../../../utils/Messages';
import { updateOutcome } from '../../../../actions/Outcome';
import OutcomeForm from './OutcomeForm';
import { T } from '../../../../components/I18n';
import { submitForm } from '../../../../utils/Action';
import { equalsSelector } from '../../../../utils/Selectors';

i18nRegister({
  fr: {
    'Update the outcome': 'Modifier le résultat',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class IncidentPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openEdit: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    return this.props
      .updateOutcome(
        this.props.exerciseId,
        this.props.incident.incident_event,
        this.props.incident.incident_id,
        this.props.incident.incident_outcome.outcome_id,
        data,
      )
      .then(() => this.handleCloseEdit());
  }

  render() {
    const initialValues = R.pick(
      ['outcome_result', 'outcome_comment'],
      this.props.incident.incident_outcome || {},
    );
    const incidentIsUpdatable = this.props.exercise?.user_can_update;
    return (
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={!incidentIsUpdatable}
          >
            <T>Edit</T>
          </MenuItem>
        </Menu>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            <T>Update the outcome</T>
          </DialogTitle>
          <DialogContent>
            <OutcomeForm
              initialValues={initialValues}
              onSubmit={this.onSubmitEdit.bind(this)}
              onSubmitSuccess={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEdit.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('outcomeForm')}
            >
              <T>Update</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

IncidentPopover.propTypes = {
  exerciseId: PropTypes.string,
  incident: PropTypes.object,
  updateOutcome: PropTypes.func,
};

const select = () => equalsSelector({
  exercise: (state, ownProps) => state.referential.entities.exercises[ownProps.exerciseId],
});

export default connect(select, { updateOutcome })(IncidentPopover);
