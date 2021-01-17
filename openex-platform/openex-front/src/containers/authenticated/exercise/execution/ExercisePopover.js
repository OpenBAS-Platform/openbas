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
  MenuItemButton,
  MenuItemLink,
} from '../../../../components/menu/MenuItem';
/* eslint-disable */
import { updateExercise } from "../../../../actions/Exercise";
import { addDryrun } from "../../../../actions/Dryrun";
import { redirectToDryrun } from "../../../../actions/Application";
/* eslint-enable */
import DryrunForm from '../check/DryrunForm';

const style = {
  float: 'left',
  marginTop: '-14px',
};

i18nRegister({
  fr: {
    'Do you want to disable this exercise?':
      'Souhaitez-vous désactiver cet exercice ?',
    'Do you want to enable this exercise?':
      'Souhaitez-vous activer cet exercice ?',
    Disable: 'Désactiver',
    Enable: 'Activer',
    'Launch a dryrun': 'Lancer une simulation',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class ExercisePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDisable: false,
      openEnable: false,
      openDryrun: false,
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
    this.props.updateExercise(this.props.exerciseId, {
      exercise_canceled: true,
    });
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
    this.props.updateExercise(this.props.exerciseId, {
      exercise_canceled: false,
    });
    this.handleCloseEnable();
  }

  handleOpenDryrun() {
    this.setState({ openDryrun: true });
    this.handlePopoverClose();
  }

  handleCloseDryrun() {
    this.setState({ openDryrun: false });
  }

  onSubmitDryrun(data) {
    return this.props.addDryrun(this.props.exerciseId, data).then((payload) => {
      this.props.redirectToDryrun(this.props.exerciseId, payload.result);
    });
  }

  submitFormDryrun() {
    this.refs.dryrunForm.submit();
  }

  render() {
    const exerciseDisabled = R.propOr(
      false,
      'exercise_canceled',
      this.props.exercise,
    );
    const exerciseIsUpdatable = R.propOr(
      false,
      'user_can_update',
      this.props.exercise,
    );

    const disableActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDisable.bind(this)}
      />,
      exerciseIsUpdatable ? (
        <Button
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
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEnable.bind(this)}
      />,
      exerciseIsUpdatable ? (
        <Button
          key="enable"
          label="Enable"
          primary={true}
          onClick={this.submitEnable.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const dryrunActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDryrun.bind(this)}
      />,
      <Button
        key="launch"
        label="Launch"
        primary={true}
        onClick={this.submitFormDryrun.bind(this)}
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
          onClose={this.handlePopoverClose.bind(this)}
        >
          <Menu multiple={false}>
            <MenuItemLink
              label="Launch a dryrun"
              onClick={this.handleOpenDryrun.bind(this)}
            />
            {/* eslint-disable-next-line no-nested-ternary */}
            {exerciseIsUpdatable ? (
              exerciseDisabled ? (
                <MenuItemButton
                  label="Enable"
                  onClick={this.handleOpenEnable.bind(this)}
                />
              ) : (
                <MenuItemButton
                  label="Disable"
                  onClick={this.handleOpenDisable.bind(this)}
                />
              )
            ) : (
              ''
            )}
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDisable}
          onClose={this.handleCloseDisable.bind(this)}
          actions={disableActions}
        >
          <T>Do you want to disable this exercise?</T>
        </Dialog>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openEnable}
          onClose={this.handleCloseEnable.bind(this)}
          actions={enableActions}
        >
          <T>Do you want to enable this exercise?</T>
        </Dialog>
        <Dialog
          title="Launch a dryrun"
          modal={false}
          open={this.state.openDryrun}
          onClose={this.handleCloseDryrun.bind(this)}
          actions={dryrunActions}
        >
          {/* eslint-disable */}
          <DryrunForm
            ref="dryrunForm"
            onSubmit={this.onSubmitDryrun.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

ExercisePopover.propTypes = {
  exerciseId: PropTypes.string,
  updateExercise: PropTypes.func,
  exercise: PropTypes.object,
  addDryrun: PropTypes.func,
  redirectToDryrun: PropTypes.func,
};

export default connect(null, { updateExercise, addDryrun, redirectToDryrun })(
  ExercisePopover,
);
