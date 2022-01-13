import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import {
  VideoSettingsOutlined,
  MarkEmailReadOutlined,
} from '@mui/icons-material';
import { withRouter } from 'react-router-dom';
import { addComcheck } from '../../../../actions/Comcheck';
import { addDryrun } from '../../../../actions/Dryrun';
import inject18n from '../../../../components/i18n';
import ComcheckForm from './ComcheckForm';
import { storeBrowser } from '../../../../actions/Schema';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

class CreateControl extends Component {
  constructor(props) {
    super(props);
    this.state = { openComcheck: false, openDryrun: false };
  }

  handleOpenComcheck() {
    this.setState({ openComcheck: true });
  }

  handleCloseComcheck() {
    this.setState({ openComcheck: false });
  }

  onSubmitComcheck(data) {
    return this.props
      .addComcheck(this.props.exerciseId, data)
      .then(() => this.props.history.push('/exercises'));
  }

  handleOpenDryrun() {
    this.setState({ openDryrun: true });
  }

  handleCloseDryrun() {
    this.setState({ openDryrun: false });
  }

  onSubmitDryrun(data) {
    return this.props
      .addDryrun(this.props.exerciseId, data)
      .then(() => this.props.history.push('/exercises'));
  }

  render() {
    const { classes, t, audiences } = this.props;
    return (
      <div>
        <SpeedDial
          classes={{ root: classes.createButton }}
          icon={<SpeedDialIcon />}
          ariaLabel={t('New control')}
        >
          <SpeedDialAction
            icon={<VideoSettingsOutlined />}
            tooltipTitle={t('New dryrun')}
            onClick={this.handleOpenDryrun.bind(this)}
          />
          <SpeedDialAction
            icon={<MarkEmailReadOutlined />}
            tooltipTitle={t('New comcheck')}
            onClick={this.handleOpenComcheck.bind(this)}
          />
        </SpeedDial>
        <Dialog
          open={this.state.openComcheck}
          TransitionComponent={Transition}
          onClose={this.handleCloseComcheck.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Launch a new comcheck')}</DialogTitle>
          <DialogContent>
            <ComcheckForm
              onSubmit={this.onSubmitComcheck.bind(this)}
              initialValues={{
                comcheck_audiences: [],
                comcheck_subject: t('Communication check'),
              }}
              audiences={audiences}
              handleClose={this.handleCloseComcheck.bind(this)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.openDryrun}
          TransitionComponent={Transition}
          onClose={this.handleCloseDryrun.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Launch a new dryrun')}</DialogTitle>
          <DialogContent>
            <ComcheckForm
              onSubmit={this.onSubmitDryrun.bind(this)}
              handleClose={this.handleCloseDryrun.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

CreateControl.propTypes = {
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  addComcheck: PropTypes.func,
  addDryrun: PropTypes.func,
  audiences: PropTypes.array,
  history: PropTypes.object,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { exerciseId } = ownProps;
  const exercise = browser.getExercise(exerciseId);
  return {
    exercise,
    audiences: exercise?.audiences,
  };
};

export default R.compose(
  connect(select, { addComcheck, addDryrun }),
  inject18n,
  withRouter,
  withStyles(styles),
)(CreateControl);
