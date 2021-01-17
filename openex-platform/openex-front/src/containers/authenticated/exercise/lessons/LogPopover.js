import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Icon } from '../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../components/menu/MenuItem';
import { updateLog, deleteLog } from '../../../../actions/Log';
import LogForm from './LogForm';

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
};

i18nRegister({
  fr: {
    'Do you want to delete this log entry?':
      'Souhaitez-vous supprimer cette entrée du journal ?',
    'Update the log entry': "Modifier l'entrée du journal",
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class LogPopover extends Component {
  constructor(props) {
    super(props);
    this.state = { openDelete: false, openEdit: false, openPopover: false };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
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
    return this.props.updateLog(
      this.props.exerciseId,
      this.props.log.log_id,
      data,
    );
  }

  submitFormEdit() {
    this.refs.logForm.submit();
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props.deleteLog(this.props.exerciseId, this.props.log.log_id);
    this.handleCloseDelete();
  }

  render() {
    const editActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      <Button
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitFormEdit.bind(this)}
      />,
    ];
    const deleteActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      <Button
        key="delete"
        label="Delete"
        primary={true}
        onClick={this.submitDelete.bind(this)}
      />,
    ];

    const initialValues = R.pick(['log_title', 'log_content'], this.props.log);
    return (
      <div style={style}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          type={Constants.BUTTON_TYPE_MAINLIST2}
        >
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onClose={this.handlePopoverClose.bind(this)}
        >
          <Menu multiple={false}>
            <MenuItemLink
              label="Edit"
              onClick={this.handleOpenEdit.bind(this)}
            />
            <MenuItemButton
              label="Delete"
              onClick={this.handleOpenDelete.bind(this)}
            />
          </Menu>
        </Popover>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <T>Do you want to delete this log entry?</T>
        </Dialog>
        <Dialog
          title="Update the log entry"
          modal={false}
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          {/* eslint-disable */}
          <LogForm
            ref="logForm"
            initialValues={initialValues}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

LogPopover.propTypes = {
  exerciseId: PropTypes.string,
  log: PropTypes.object,
  updateLog: PropTypes.func,
  deleteLog: PropTypes.func,
};

export default connect(null, { updateLog, deleteLog })(LogPopover);
