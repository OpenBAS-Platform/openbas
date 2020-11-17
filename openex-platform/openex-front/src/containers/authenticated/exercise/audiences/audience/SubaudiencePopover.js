import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { injectIntl } from 'react-intl';
import { T } from '../../../../../components/I18n';
import Theme from '../../../../../components/Theme';
import { i18nRegister } from '../../../../../utils/Messages';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Popover } from '../../../../../components/Popover';
import { Menu } from '../../../../../components/Menu';
import { Dialog } from '../../../../../components/Dialog';
import { IconButton, FlatButton } from '../../../../../components/Button';
import { Icon } from '../../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../../components/menu/MenuItem';
import {
  updateSubaudience,
  selectSubaudience,
  downloadExportSubaudience,
  deleteSubaudience,
} from '../../../../../actions/Subaudience';
import SubaudienceForm from './SubaudienceForm';

const style = {
  float: 'left',
  marginTop: '-14px',
};

i18nRegister({
  fr: {
    'Update the sub-audience': 'Modifier la sous-audience',
    'Do you want to delete this sub-audience?':
      'Souhaitez-vous supprimer cette sous-audience ?',
    'Do you want to disable this sub-audience?':
      'Souhaitez-vous désactiver cette sous-audience ?',
    'Do you want to enable this sub-audience?':
      'Souhaitez-vous activer cette sous-audience ?',
    Disable: 'Désactiver',
    Enable: 'Activer',
  },
});

class SubaudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openEnable: false,
      openDisable: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ openPopover: true, anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ openPopover: false });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    return this.props.updateSubaudience(
      this.props.exerciseId,
      this.props.audienceId,
      this.props.subaudience.subaudience_id,
      data,
    );
  }

  submitFormEdit() {
    this.refs.subaudienceForm.submit();
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props
      .deleteSubaudience(
        this.props.exerciseId,
        this.props.audienceId,
        this.props.subaudience.subaudience_id,
      )
      .then(() => {
        this.props.selectSubaudience(
          this.props.exerciseId,
          this.props.audienceId,
          undefined,
        );
      });
    this.handleCloseDelete();
  }

  handleOpenDisable() {
    this.setState({ openDisable: true });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({ openDisable: false });
  }

  submitDisable() {
    this.props.updateSubaudience(
      this.props.exerciseId,
      this.props.audienceId,
      this.props.subaudience.subaudience_id,
      { subaudience_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenEnable() {
    this.setState({ openEnable: true });
    this.handlePopoverClose();
  }

  handleCloseEnable() {
    this.setState({ openEnable: false });
  }

  submitEnable() {
    this.props.updateSubaudience(
      this.props.exerciseId,
      this.props.audienceId,
      this.props.subaudience.subaudience_id,
      { subaudience_enabled: true },
    );
    this.handleCloseEnable();
  }

  t(id) {
    return this.props.intl.formatMessage({ id });
  }

  handleDownloadAudience() {
    this.props.downloadExportSubaudience(
      this.props.exerciseId,
      this.props.audienceId,
      this.props.subaudience.subaudience_id,
    );
    this.handlePopoverClose();
  }

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor;
    }
    return Theme.palette.textColor;
  }

  render() {
    const subaudience_enabled = R.propOr(
      true,
      'subaudience_enabled',
      this.props.subaudience,
    );
    const subaudience_is_updatable = R.propOr(
      true,
      'user_can_update',
      this.props.subaudience,
    );
    const subaudience_is_deletable = R.propOr(
      true,
      'user_can_delete',
      this.props.subaudience,
    );

    const editActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      subaudience_is_updatable ? (
        <FlatButton
          key="update"
          label="Update"
          primary={true}
          onClick={this.submitFormEdit.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const deleteActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      subaudience_is_deletable ? (
        <FlatButton
          key="delete"
          label="Delete"
          primary={true}
          onClick={this.submitDelete.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const disableActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDisable.bind(this)}
      />,
      subaudience_is_updatable ? (
        <FlatButton
          key="disable"
          label="Disable"
          primary={true}
          onClick={this.submitDisable.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const enableActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEnable.bind(this)}
      />,
      subaudience_is_updatable ? (
        <FlatButton
          key="enable"
          label="Enable"
          primary={true}
          onClick={this.submitEnable.bind(this)}
        />
      ) : (
        ''
      ),
    ];

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon
            name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}
            color={this.switchColor(
              !this.props.audience.audience_enabled
                || !this.props.subaudience.subaudience_enabled,
            )}
          />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handlePopoverClose.bind(this)}
        >
          <Menu multiple={false}>
            {subaudience_is_updatable ? (
              <MenuItemLink
                label="Edit"
                onClick={this.handleOpenEdit.bind(this)}
              />
            ) : (
              ''
            )}
            {subaudience_is_updatable ? (
              subaudience_enabled ? (
                <MenuItemButton
                  label="Disable"
                  onClick={this.handleOpenDisable.bind(this)}
                />
              ) : (
                <MenuItemButton
                  label="Enable"
                  onClick={this.handleOpenEnable.bind(this)}
                />
              )
            ) : (
              ''
            )}
            <MenuItemLink
              label="Export to XLS"
              onClick={this.handleDownloadAudience.bind(this)}
            />
            {subaudience_is_deletable ? (
              <MenuItemButton
                label="Delete"
                onClick={this.handleOpenDelete.bind(this)}
              />
            ) : (
              ''
            )}
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to delete this sub-audience?</T>
        </Dialog>
        <Dialog
          title="Update the sub-audience"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <SubaudienceForm
            ref="subaudienceForm"
            initialValues={R.pick(['subaudience_name'], this.props.subaudience)}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
        </Dialog>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDisable}
          onRequestClose={this.handleCloseDisable.bind(this)}
          actions={disableActions}
        >
          <T>Do you want to disable this sub-audience?</T>
        </Dialog>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openEnable}
          onRequestClose={this.handleCloseEnable.bind(this)}
          actions={enableActions}
        >
          <T>Do you want to enable this sub-audience?</T>
        </Dialog>
      </div>
    );
  }
}

SubaudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  deleteSubaudience: PropTypes.func,
  updateSubaudience: PropTypes.func,
  selectSubaudience: PropTypes.func,
  downloadExportSubaudience: PropTypes.func,
  audience: PropTypes.object,
  subaudience: PropTypes.object,
  subaudiences: PropTypes.array,
  children: PropTypes.node,
  intl: PropTypes.object,
};

export default connect(null, {
  updateSubaudience,
  selectSubaudience,
  downloadExportSubaudience,
  deleteSubaudience,
})(injectIntl(SubaudiencePopover));
