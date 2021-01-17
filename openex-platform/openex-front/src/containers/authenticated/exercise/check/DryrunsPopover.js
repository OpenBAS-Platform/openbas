import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Icon } from '../../../../components/Icon';
import { MenuItemLink } from '../../../../components/menu/MenuItem';
/* eslint-disable */
import { addDryrun } from "../../../../actions/Dryrun";
import { redirectToDryrun } from "../../../../actions/Application";
/* eslint-enable */
import DryrunForm from './DryrunForm';

const style = {
  float: 'left',
  marginTop: '-14px',
};

i18nRegister({
  fr: {
    'Launch a dryrun': 'Lancer une simulation',
  },
});

class DryrunsPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openLaunch: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.preventDefault();
    this.setState({
      openPopover: true,
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

  submitFormLaunch() {
    this.refs.dryrunForm.submit();
  }

  render() {
    const launchActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseLaunch.bind(this)}
      />,
      <Button
        key="launch"
        label="Launch"
        primary={true}
        onClick={this.submitFormLaunch.bind(this)}
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
              label="Launch a dryrun"
              onClick={this.handleOpenLaunch.bind(this)}
            />
          </Menu>
        </Popover>
        <Dialog
          title="Launch a dryrun"
          modal={false}
          open={this.state.openLaunch}
          onRequestClose={this.handleCloseLaunch.bind(this)}
          actions={launchActions}
        >
          {/* eslint-disable */}
          <DryrunForm
            ref="dryrunForm"
            onSubmit={this.onSubmitLaunch.bind(this)}
          />
          {/* eslint-enable */}
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

export default connect(null, { addDryrun, redirectToDryrun })(DryrunsPopover);
