import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import withStyles from '@mui/styles/withStyles';
import { MoreVert } from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import Slide from '@mui/material/Slide';
import { i18nRegister } from '../../../../../utils/Messages';
import { addDryrun } from '../../../../../actions/Dryrun';
import { redirectToDryrun } from '../../../../../actions/Application';
import DryrunForm from './DryrunForm';
import { submitForm } from '../../../../../utils/Action';
import { T } from '../../../../../components/I18n';

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

i18nRegister({
  fr: {
    'Launch a dryrun': 'Lancer une simulation',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class DryrunsPopover extends Component {
  constructor(props) {
    super(props);
    this.state = { openLaunch: false };
  }

  handlePopoverOpen(event) {
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenLaunch() {
    this.setState({ openLaunch: true });
    this.handlePopoverClose();
  }

  handleCloseLaunch() {
    this.setState({ openLaunch: false });
  }

  onSubmitLaunch(data) {
    return this.props.addDryrun(this.props.exerciseId, data).then((payload) => {
      this.props.redirectToDryrun(this.props.exerciseId, payload.result);
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenLaunch.bind(this)}>
            <T>Launch a dryrun</T>
          </MenuItem>
        </Menu>
        <Dialog
          modal={false}
          open={this.state.openLaunch}
          TransitionComponent={Transition}
          onClose={this.handleCloseLaunch.bind(this)}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>
            <T>Launch a dryrun</T>
          </DialogTitle>
          <DialogContent>
            <DryrunForm onSubmit={this.onSubmitLaunch.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseLaunch.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('dryrunForm')}
            >
              <T>Launch</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DryrunsPopover.propTypes = {
  exerciseId: PropTypes.string,
  addDryrun: PropTypes.func,
  redirectToDryrun: PropTypes.func,
};

export default R.compose(
  connect(null, { addDryrun, redirectToDryrun }),
  withStyles(styles),
)(DryrunsPopover);
