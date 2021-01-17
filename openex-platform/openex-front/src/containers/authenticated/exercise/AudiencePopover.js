import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import * as Constants from '../../../constants/ComponentTypes';
import { Popover } from '../../../components/Popover';
import { Menu } from '../../../components/Menu';
import { Dialog } from '../../../components/Dialog';
import { Icon } from '../../../components/Icon';
import { MenuItemButton } from '../../../components/menu/MenuItem';
import { updateAudience } from '../../../actions/Audience';

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
};

i18nRegister({
  fr: {
    'Do you want to disable this audience?':
      'Souhaitez-vous désactiver cette audience ?',
    'Do you want to enable this audience?':
      'Souhaitez-vous activer cette audience ?',
    Disable: 'Désactiver',
    Enable: 'Activer',
  },
});

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openEnable: false,
      openDisable: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDisable() {
    this.setState({ openDisable: true });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({ openDisable: false });
  }

  submitDisable() {
    this.props.updateAudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: false },
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
    this.props.updateAudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: true },
    );
    this.handleCloseEnable();
  }

  render() {
    const audienceEnabled = R.propOr(
      true,
      'audience_enabled',
      this.props.audience,
    );
    const audienceIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.audience,
    );

    const disableActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDisable.bind(this)}
      />,
      audienceIsUpdatable ? (
        <Button
          label="Disable"
          primary={true}
          onClick={this.submitDisable.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const enableActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEnable.bind(this)}
      />,
      audienceIsUpdatable ? (
        <Button
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
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          type={Constants.BUTTON_TYPE_MAINLIST2}
        >
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handlePopoverClose.bind(this)}
        >
          {audienceIsUpdatable ? (
            <Menu multiple={false}>
              {/* eslint-disable-next-line no-nested-ternary */}
              {audienceIsUpdatable ? (
                audienceEnabled ? (
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
            </Menu>
          ) : (
            ''
          )}
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDisable}
          onRequestClose={this.handleCloseDisable.bind(this)}
          actions={disableActions}
        >
          <T>Do you want to disable this audience?</T>
        </Dialog>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openEnable}
          onRequestClose={this.handleCloseEnable.bind(this)}
          actions={enableActions}
        >
          <T>Do you want to enable this audience?</T>
        </Dialog>
      </div>
    );
  }
}

AudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  audience: PropTypes.object,
  updateAudience: PropTypes.func,
};

export default connect(null, { updateAudience })(AudiencePopover);
