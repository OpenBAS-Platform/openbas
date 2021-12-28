import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import withStyles from '@mui/styles/withStyles';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { redirectToChecks } from '../../../../../actions/Application';
import { deleteComcheck } from '../../../../../actions/Comcheck';

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

i18nRegister({
  fr: {
    'Do you want to delete this comcheck?':
      'Souhaitez-vous supprimer ce test de communication ?',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class ComcheckPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.preventDefault();
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    if (this.props.listenDeletionCall) this.props.listenDeletionCall();
    this.props
      .deleteComcheck(this.props.exerciseId, this.props.comcheck.comcheck_id)
      .then(() => this.props.redirectToChecks(this.props.exerciseId));
  }

  render() {
    const { classes } = this.props;
    const comcheckIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.comcheck,
    );
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large">
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={!comcheckIsDeletable}
          >
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to delete this comcheck?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDelete.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDelete.bind(this)}
            >
              <T>Delete</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

ComcheckPopover.propTypes = {
  exerciseId: PropTypes.string,
  deleteComcheck: PropTypes.func,
  redirectToChecks: PropTypes.func,
  listenDeletionCall: PropTypes.func,
  comcheck: PropTypes.object,
};

export default R.compose(
  connect(null, { deleteComcheck, redirectToChecks }),
  withStyles(styles),
)(ComcheckPopover);
