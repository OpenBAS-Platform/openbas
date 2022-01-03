import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import withStyles from '@mui/styles/withStyles';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slide from '@mui/material/Slide';
import { i18nRegister } from '../../../../utils/Messages';
import { addLog } from '../../../../actions/Log';
import LogForm from './LogForm';
import { T } from '../../../../components/I18n';
import { submitForm } from '../../../../utils/Action';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

i18nRegister({
  fr: {
    'Add an entry': 'Ajouter une entrée',
  },
});

class LogsPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openCreate: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenCreate() {
    this.setState({ openCreate: true });
    this.handlePopoverClose();
  }

  handleCloseCreate() {
    this.setState({ openCreate: false });
  }

  onSubmitCreate(data) {
    return this.props
      .addLog(this.props.exerciseId, data)
      .then(() => this.handleCloseCreate());
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
          <MenuItem onClick={this.handleOpenCreate.bind(this)}>
            <T>Add an entry</T>
          </MenuItem>
        </Menu>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openCreate}
          onClose={this.handleCloseCreate.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            <T>Add an entry</T>
          </DialogTitle>
          <DialogContent>
            <LogForm onSubmit={this.onSubmitCreate.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseCreate.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => submitForm('logForm')}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

LogsPopover.propTypes = {
  exerciseId: PropTypes.string,
  addLog: PropTypes.func,
};

export default R.compose(
  connect(null, { addLog }),
  withStyles(styles),
)(LogsPopover);
