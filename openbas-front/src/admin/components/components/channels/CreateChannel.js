import { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import inject18n from '../../../../components/i18n';
import { addChannel } from '../../../../actions/channels/channel-action';
import ChannelForm from './ChannelForm';
import Drawer from '../../../../components/common/Drawer';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

class CreateChannel extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(data) {
    return this.props
      .addChannel(data)
      .then((result) => (result.result ? this.handleClose() : result));
  }

  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Drawer
          open={this.state.open}
          handleClose={this.handleClose.bind(this)}
          title={t('Create a new channel')}
        >
          <ChannelForm
            onSubmit={this.onSubmit.bind(this)}
            initialValues={{}}
            handleClose={this.handleClose.bind(this)}
          />
        </Drawer>
      </div>
    );
  }
}

CreateChannel.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  addChannel: PropTypes.func,
};

export default R.compose(
  connect(null, { addChannel }),
  inject18n,
  withStyles(styles),
)(CreateChannel);
