import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Timeline from '../../../components/Timeline';
import { timeDiff } from '../../../utils/Time';
import { i18nRegister } from '../../../utils/Messages';
import * as Constants from '../../../constants/ComponentTypes';
import { Dialog } from '../../../components/Dialog';
import { Popover } from '../../../components/Popover';
import { Menu } from '../../../components/Menu';
import { IconButton, FlatButton } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { MenuItemLink } from '../../../components/menu/MenuItem';
/* eslint-disable */
import {
  downloadExportInjects,
  shiftAllInjects,
  simulateChangeDurationExercise,
  changeDurationExercise,
} from "../../../actions/Inject";

import ShiftForm from "./ShiftForm";
import InjectTable from "../../../components/InjectTable";
import { T } from "../../../components/I18n";
import { fetchExercise } from "../../../actions/Exercise";
import {
  START_TIME_OF_DAY,
  END_TIME_OF_DAY,
} from "../../../constants/ComponentTypes";
import Theme from "../../../components/Theme";
import { redirectToHome } from "../../../actions/Application";
/* eslint-enable */

const style = {
  float: 'left',
  marginTop: '-14px',
};

const styles = {
  hidden: {
    display: 'none',
  },
  divSimulateExerciseResume: {
    margin: '10px',
  },
  showDiscontinueDiv: {
    marginTop: '10px',
    padding: '10px',
    border: '1px solid',
    borderColor: Theme.palette.borderColor,
    borderRadius: '5px',
    fontSize: '14px',
  },
  showWarningSimulate: {
    marginTop: '10px',
    padding: '10px',
    border: '1px solid',
    borderColor: '#F57C00',
    color: '#F57C00',
    borderRadius: '5px',
    fontSize: '14px',
    marginBottom: '10px',
  },
  useCloseHoursCheckbox: {
    width: '100%',
  },
  useCloseHoursText: {
    marginTop: '10px',
    marginLeft: '25px',
    color: Theme.palette.primary2Color,
    fontStyle: 'italic',
    fontSize: '12px',
  },
  changeDuration: {
    line: {
      line: {
        display: 'inline-block',
        width: '100%',
        verticalAlign: 'middle',
      },
    },
    label: {
      display: 'inline-block',
      width: '40%',
      verticalAlign: 'middle',
    },
    input: {
      display: 'inline-block',
      width: '40%',
      verticalAlign: 'middle',
      margin: '0px 15px',
    },
    inputHour: {
      display: 'inline-block',
      width: '10%',
      verticalAlign: 'middle',
      margin: '0px 15px',
    },
    unitHour: {
      display: 'inline-block',
      width: '10%',
      verticalAlign: 'middle',
      margin: '0px 15px',
    },
  },
};

i18nRegister({
  fr: {
    'Export injects to XLS': 'Export des injections en XLS',
    Shift: 'Décaler',
    Close: 'Fermer',
    Modify: 'Modifier',
    'Shift all injects': 'Décaler toutes les injections',
    'Abstract shift all injects': 'Récapitulatif des injections',
    Change: 'Changer',
    'Change the duration of the exercise': "Changer la durée de l'exercice",
    'Abstract change duration':
      "Récapitulatif du changement de la durée de l'exercice",
    'First inject: ': 'Premier inject : ',
    'Last inject: ': 'Dernier inject : ',
    'Exercise wanted duration: ': "Durée voulue de l'exercice : ",
    'Current exercise duration: ': "Durée actuelle de l'exercice : ",
    'Allow move inject outside of working hours.':
      "Autoriser le positionnement d'un inject en dehors des horaires de journée.",
    'start time of the day: ': 'Heure de début de journée : ',
    'end time of the day: ': 'Heure de fin de journée : ',
    'Count closing hours in continuity of injects':
      'Comptabiliser les heures de fermeture dans la continuité des injects',
    'If checked, the start time of the day will announce the first day of exercise.':
      "Si coché, l'heure de début de journée annoncera le première inject de la journée d'exercice.",
    hour: 'H',
    hours: 'heures',
    Simulate: 'Simuler',
    'Simulation of the modification of the exercise':
      "Simulation de la modification de la durée de l'exercice",
    'Exercise estimated end: ': "Fin estimée de l'exercice : ",
    'Exercise estimated duration: ': "Durée estimée de l'exercice : ",
  },
});

class ScenarioPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: '',
      openPopover: false,
      openShift: false,
      openAbstractShift: false,
      openChangeDuration: false,
      openResumeChangeDuration: false,
      checkDay: true,
      fixedHeader: true,
      fixedFooter: false,
      stripedRows: false,
      showRowHover: false,
      selectable: false,
      multiSelectable: false,
      enableSelectAll: false,
      deselectOnClickaway: false,
      showCheckboxes: false,
      height: '200px',
      start_time_of_day: START_TIME_OF_DAY,
      end_time_of_day: END_TIME_OF_DAY,
      checkContinuousDays: true,
      checkUseCloseHours: false,
      showDiscontinue: 'none',
      duration_desired: '',
      new_injects: {},
      exerciseEndDateSimulate: '',
      exerciseDurationSimulate: '',
    };
    this.handleChangeCheckContinuousDays = this.handleChangeCheckContinuousDays.bind(
      this,
    );
    this.handleChangeCheckUseCloseHours = this.handleChangeCheckUseCloseHours.bind(
      this,
    );
    this.handleChangeDurationDesired = this.handleChangeDurationDesired.bind(
      this,
    );
    this.handleChangeStartTimeDay = this.handleChangeStartTimeDay.bind(this);
    this.handleChangeEndTimeDay = this.handleChangeEndTimeDay.bind(this);
  }

  getFirstInjectDate() {
    return R.pipe(
      R.values,
      R.sort((a, b) => timeDiff(a.inject_date, b.inject_date)),
      R.head,
      R.prop('inject_date'),
    )(this.props.injects);
  }

  getLastInjectDate() {
    return R.pipe(
      R.values,
      R.sort((a, b) => timeDiff(b.inject_date, a.inject_date)),
      R.head,
      R.prop('inject_date'),
    )(this.props.injects);
  }

  getExerciseDuration() {
    const duration = timeDiff(
      this.getLastInjectDate(),
      this.getFirstInjectDate(),
    );
    return Math.ceil(duration / (1000 * 60 * 60));
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ openPopover: true, anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ openPopover: false });
  }

  handleDownloadInjects() {
    this.props.downloadExportInjects(this.props.exerciseId);
    this.handlePopoverClose();
  }

  handleOpenShift() {
    this.setState({ openShift: true });
    this.handlePopoverClose();
  }

  handleCancelShift() {
    this.setState({ openShift: false });
  }

  handleCloseShift() {
    this.setState({ openShift: false });
    this.handleAbstractOpenShift();
  }

  handleAbstractOpenShift() {
    this.setState({ openAbstractShift: true });
    this.handlePopoverClose();
  }

  handleAbstractCloseShift() {
    this.setState({ openAbstractShift: false });
  }

  handleOpenChangeDuration() {
    const exerciseDuration = this.getExerciseDuration();
    this.setState({
      duration: exerciseDuration,
      duration_desired: exerciseDuration,
      openChangeDuration: true,
    });
    this.handlePopoverClose();
  }

  handleCancelChangeDuration() {
    this.setState({ openChangeDuration: false });
  }

  handleCancelResumeChangeDuration() {
    this.setState({ openResumeChangeDuration: false });
  }

  handleChangeEndTimeDay(event) {
    const { target } = event;
    const { value } = target;
    this.setState({ end_time_of_day: value });
  }

  handleChangeStartTimeDay(event) {
    const { target } = event;
    const { value } = target;
    this.setState({ start_time_of_day: value });
  }

  handleChangeDurationDesired(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ duration_desired: value });
  }

  handleChangeCheckUseCloseHours(event, isChecked) {
    this.setState({ checkUseCloseHours: isChecked });
  }

  handleChangeCheckContinuousDays(event, isChecked) {
    if (isChecked) {
      this.setState({
        showDiscontinue: 'none',
        checkContinuousDays: isChecked,
      });
    } else {
      this.setState({
        showDiscontinue: 'block',
        checkContinuousDays: isChecked,
      });
    }
  }

  onSubmitShift(data) {
    const firstInjectDate = R.pipe(
      R.values,
      R.sort((a, b) => timeDiff(a.inject_date, b.inject_date)),
      R.head,
      R.prop('inject_date'),
    )(this.props.injects);
    // eslint-disable-next-line no-param-reassign
    data.old_date = firstInjectDate;
    return this.props.shiftAllInjects(this.props.exerciseId, data);
  }

  submitFormShift() {
    this.refs.shiftForm.submit();
  }

  submitFormResumeChangeDuration() {
    const data = {
      duration_desired: this.state.duration_desired,
      continuous_day: this.state.checkContinuousDays,
      start_time_day: this.state.start_time_of_day,
      end_time_day: this.state.end_time_of_day,
      use_closing_hours: this.state.checkUseCloseHours,
    };
    this.props.changeDurationExercise(this.props.exerciseId, data).then(() => {
      this.setState({ openResumeChangeDuration: false });
      this.props.redirectToHome();
    });
  }

  submitFormChangeDuration() {
    if (this.state.duration_desired === '') {
      alert('Please, choose duration for this exercise');
    } else {
      const regexOnlyNumber = RegExp('^[0-9]*$');
      if (!regexOnlyNumber.test(this.state.duration_desired)) {
        alert('Please, choose valid number');
      } else if (
        parseInt(this.state.start_time_of_day, 10)
        >= parseInt(this.state.end_time_of_day, 10)
      ) {
        alert('Please check start and end day hours');
      } else {
        const data = {
          duration_desired: this.state.duration_desired,
          continuous_day: this.state.checkContinuousDays,
          start_time_day: this.state.start_time_of_day,
          end_time_day: this.state.end_time_of_day,
          use_closing_hours: this.state.checkUseCloseHours,
        };
        this.props
          .simulateChangeDurationExercise(this.props.exerciseId, data)
          .then((returnInjects) => {
            const newInjects = [];
            let index = 0;
            let exerciseEndDateSimulate;
            let exerciseDurationSimulate;
            returnInjects.result.forEach((element) => {
              if (index === 0) {
                exerciseEndDateSimulate = element.exercise_end_date;
                exerciseDurationSimulate = element.exercise_duration;
              }
              // eslint-disable-next-line no-plusplus
              index++;
              newInjects.push({
                ts: element.ts,
                text: `${element.event} - ${element.incident} - ${element.inject}`,
              });
              newInjects.sort((injectA, injectB) => {
                if (injectA.ts === injectB.ts) {
                  return 0;
                }
                return injectA.ts < injectB.ts ? -1 : 1;
              });
            });

            this.setState({
              exerciseEndDateSimulate,
              exerciseDurationSimulate,
            });
            this.setState({
              openChangeDuration: false,
              newInjects,
            });
            this.setState({
              openResumeChangeDuration: true,
            });
          });
      }
    }
  }

  render() {
    const shiftActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCancelShift.bind(this)}
      />,
      <FlatButton
        key="shift"
        label="Shift"
        primary={true}
        onClick={this.submitFormShift.bind(this)}
      />,
    ];
    const changeActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCancelChangeDuration.bind(this)}
      />,
      <FlatButton
        key="change"
        label="Simulate"
        primary={true}
        onClick={this.submitFormChangeDuration.bind(this)}
      />,
    ];
    const resumeChangeDurationActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCancelResumeChangeDuration.bind(this)}
      />,
      <FlatButton
        key="change"
        label="Modify"
        primary={true}
        onClick={this.submitFormResumeChangeDuration.bind(this)}
      />,
    ];
    const abstractShiftActions = [
      <FlatButton
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleAbstractCloseShift.bind(this)}
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
              label="Export injects to XLS"
              onClick={this.handleDownloadInjects.bind(this)}
            />
            {this.props.userCanUpdate ? (
              <MenuItemLink
                label="Shift all injects"
                onClick={this.handleOpenShift.bind(this)}
              />
            ) : (
              ''
            )}
            {this.props.userCanUpdate ? (
              <MenuItemLink
                label="Change the duration of the exercise"
                onClick={this.handleOpenChangeDuration.bind(this)}
              />
            ) : (
              ''
            )}
          </Menu>
        </Popover>

        <Dialog
          title="Shift all injects"
          modal={false}
          open={this.state.openShift}
          onRequestClose={this.handleCancelShift.bind(this)}
          actions={shiftActions}
        >
          {/* eslint-disable */}
          <ShiftForm
            ref="shiftForm"
            onSubmitSuccess={this.handleCloseShift.bind(this)}
            onSubmit={this.onSubmitShift.bind(this)}
            injects={this.props.injects}
          />
          {/* eslint-enable */}
        </Dialog>

        <Dialog
          title="Abstract shift all injects"
          modal={true}
          open={this.state.openAbstractShift}
          onRequestClose={this.handleAbstractCloseShift.bind(this)}
          actions={abstractShiftActions}
        >
          <InjectTable injects={this.props.injects} />
        </Dialog>

        <Dialog
          title="Simulation of the modification of the exercise"
          modal={true}
          open={this.state.openResumeChangeDuration}
          onRequestClose={this.handleCancelResumeChangeDuration.bind(this)}
          autoScrollBodyContent={true}
          actions={resumeChangeDurationActions}
        >
          <div>
            {this.state.checkContinuousDays === false ? (
              <div style={styles.showWarningSimulate}>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                Attention, dans le cadre d'une journée discontinue toute
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                modification d'exercice est irréversible.
              </div>
            ) : (
              ''
            )}
            <div style={styles.divSimulateExerciseResume}>
              <T>Exercise estimated end: </T>
              {`${new Date(
                this.state.exerciseEndDateSimulate,
              ).toLocaleDateString('fr-FR')} ${new Date(
                this.state.exerciseEndDateSimulate,
              ).toLocaleTimeString('fr-FR')}`}
            </div>

            <div style={styles.divSimulateExerciseResume}>
              <T>Exercise estimated duration: </T>
              {this.state.exerciseDurationSimulate}
              &nbsp;
              <T>hours</T>
            </div>

            {Array.isArray(this.state.new_injects) ? (
              <Timeline items={this.state.new_injects} />
            ) : (
              ''
            )}
          </div>
        </Dialog>

        <Dialog
          title="Change the duration of the exercise"
          modal={true}
          open={this.state.openChangeDuration}
          onRequestClose={this.handleCancelChangeDuration.bind(this)}
          actions={changeActions}
          autoScrollBodyContent={true}
        >
          <InjectTable injects={this.props.injects} />

          <div>
            <div style={styles.changeDuration.line}>
              <div style={styles.changeDuration.label}>
                <p>
                  <T>First inject: </T>
                </p>
              </div>
              <div style={styles.changeDuration.input}>
                {`${new Date(this.getFirstInjectDate()).toLocaleDateString(
                  'fr-FR',
                )} ${new Date(this.getFirstInjectDate()).toLocaleTimeString(
                  'fr-FR',
                )}`}
              </div>
            </div>

            <div style={styles.changeDuration.line}>
              <div style={styles.changeDuration.label}>
                <p>
                  <T>Last inject: </T>
                </p>
              </div>
              <div style={styles.changeDuration.input}>
                {`${new Date(this.getLastInjectDate()).toLocaleDateString(
                  'fr-FR',
                )} ${new Date(this.getLastInjectDate()).toLocaleTimeString(
                  'fr-FR',
                )}`}
              </div>
            </div>

            <div style={styles.changeDuration.line}>
              <div style={styles.changeDuration.label}>
                <p>
                  <T>Current exercise duration: </T>
                </p>
              </div>
              <div style={styles.changeDuration.inputHour}>
                {/* eslint-disable */}
                <TextField
                  id="duration"
                  ref="duration"
                  name="duration"
                  fullWidth={true}
                  value={this.state.duration}
                  type="text"
                  disabled={true}
                />
                {/* eslint-enable */}
              </div>
              <div style={styles.changeDuration.unitHour}>
                <p>
                  <T>hours</T>
                </p>
              </div>
            </div>

            <div style={styles.changeDuration.line}>
              <div style={styles.changeDuration.label}>
                <p>
                  <T>Exercise wanted duration: </T>
                </p>
              </div>
              <div style={styles.changeDuration.inputHour}>
                {/* eslint-disable */}
                <TextField
                  id="duration_desired"
                  ref="duration_desired"
                  name="duration_desired"
                  fullWidth={true}
                  value={this.state.duration_desired}
                  onChange={this.handleChangeDurationDesired}
                  type="number"
                  disabled={false}
                />
                {/* eslint-enable */}
              </div>
              <div style={styles.changeDuration.unitHour}>
                <p>
                  <T>hours</T>
                </p>
              </div>
            </div>

            <div style={styles.checkbox}>
              {/* eslint-disable */}
              <Checkbox
                ref="checkContinuousDays"
                name="checkContinuousDays"
                defaultChecked={this.state.checkContinuousDays}
                onCheck={this.handleChangeCheckContinuousDays}
                label={<T>Allow move inject outside of working hours.</T>}
                labelPosition="right"
              />
              {/* eslint-enable */}
            </div>

            <div style={{ display: this.state.showDiscontinue }}>
              <div style={styles.showDiscontinueDiv}>
                <div style={styles.changeDuration.line}>
                  <div style={styles.changeDuration.label}>
                    <p>
                      <T>start time of the day: </T>
                    </p>
                  </div>
                  <div style={styles.changeDuration.inputHour}>
                    {/* eslint-disable */}
                    <TextField
                      id="start_time_day"
                      ref="start_time_day"
                      name="start_time_day"
                      fullWidth={true}
                      value={this.state.start_time_of_day}
                      type="number"
                      disabled={false}
                      onChange={this.handleChangeStartTimeDay}
                    />
                    {/* eslint-disable */}
                  </div>
                  <div style={styles.changeDuration.unitHour}>
                    <p>
                      <T>hour</T>
                    </p>
                  </div>
                </div>
                <div style={styles.changeDuration.line}>
                  <div style={styles.changeDuration.label}>
                    <p>
                      <T>end time of the day: </T>
                    </p>
                  </div>
                  <div style={styles.changeDuration.inputHour}>
                    <TextField
                      id="end_time_day"
                      ref="end_time_day"
                      name="end_time_day"
                      fullWidth={true}
                      type="number"
                      value={this.state.end_time_of_day}
                      disabled={false}
                      onChange={this.handleChangeEndTimeDay}
                    />
                  </div>
                  <div style={styles.changeDuration.unitHour}>
                    <p>
                      <T>hour</T>
                    </p>
                  </div>
                </div>
                <div style={styles.useCloseHoursCheckbox}>
                  <Checkbox
                    ref="useCloseHours"
                    name="useCloseHours"
                    defaultChecked={this.state.useCloseHours}
                    onCheck={this.handleChangeCheckUseCloseHours}
                    label={<T>Count closing hours in continuity of injects</T>}
                    labelPosition="right"
                  />
                  <div style={styles.useCloseHoursText}>
                    <T>
                      If checked, the start time of the day will announce the
                      first day of exercise.
                    </T>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

ScenarioPopover.propTypes = {
  exerciseId: PropTypes.string,
  downloadExportInjects: PropTypes.func,
  shiftAllInjects: PropTypes.func,
  changeDurationExercise: PropTypes.func,
  simulateChangeDurationExercise: PropTypes.func,
  injects: PropTypes.object,
  exercises: PropTypes.array,
  fetchExercise: PropTypes.func,
  userCanUpdate: PropTypes.bool,
  redirectToHome: PropTypes.func,
};

const select = (state) => ({
  exercise: state.referential.entities.exercises,
});

export default connect(select, {
  downloadExportInjects,
  shiftAllInjects,
  simulateChangeDurationExercise,
  redirectToHome,
  changeDurationExercise,
  fetchExercise,
})(ScenarioPopover);
