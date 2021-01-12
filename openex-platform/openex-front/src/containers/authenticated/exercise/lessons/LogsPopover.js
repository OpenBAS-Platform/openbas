import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Dialog } from '../../../../components/Dialog';
import { IconButton, FlatButton } from '../../../../components/Button';
import { Icon } from '../../../../components/Icon';
import { MenuItemLink } from '../../../../components/menu/MenuItem';
import { addLog } from '../../../../actions/Log';
import LogForm from './LogForm';

const style = {
  float: 'left',
  marginTop: '-14px',
};

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
    this.setState({ openPopover: false });
  }

  handleOpenCreate() {
    this.setState({ openCreate: true });
    this.handlePopoverClose();
  }

  handleCloseCreate() {
    this.setState({ openCreate: false });
  }

  onSubmitCreate(data) {
    return this.props.addLog(this.props.exerciseId, data);
  }

  submitFormCreate() {
    // eslint-disable-next-line react/no-string-refs
    this.refs.logForm.submit();
  }

  render() {
    const createActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseCreate.bind(this)}
      />,
      <FlatButton
        key="create"
        label="Create"
        primary={true}
        onClick={this.submitFormCreate.bind(this)}
      />,
    ];

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handlePopoverClose.bind(this)}
        >
          <Menu multiple={false}>
            <MenuItemLink
              label="Add an entry"
              onClick={this.handleOpenCreate.bind(this)}
            />
          </Menu>
        </Popover>
        <Dialog
          title="Add an entry"
          modal={false}
          open={this.state.openCreate}
          onRequestClose={this.handleCloseCreate.bind(this)}
          actions={createActions}
        >
          {/* eslint-disable */}
          <LogForm
            ref="logForm"
            onSubmit={this.onSubmitCreate.bind(this)}
            onSubmitSuccess={this.handleCloseCreate.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

LogsPopover.propTypes = {
  exerciseId: PropTypes.string,
  addLog: PropTypes.func,
};

export default connect(null, { addLog })(LogsPopover);
