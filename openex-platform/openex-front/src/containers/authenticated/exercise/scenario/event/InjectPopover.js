import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { dayFormat, timeFormat, dateToISO } from '../../../../../utils/Time';
import Theme from '../../../../../components/Theme';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Popover } from '../../../../../components/Popover';
import { Menu } from '../../../../../components/Menu';
import { Dialog, DialogTitleElement } from '../../../../../components/Dialog';
import { IconButton, FlatButton } from '../../../../../components/Button';
import { Icon } from '../../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../../components/menu/MenuItem';
import { Step, Stepper, StepLabel } from '../../../../../components/Stepper';
/* eslint-disable */
import { fetchIncident, selectIncident } from "../../../../../actions/Incident";
import { downloadFile } from "../../../../../actions/File";
import { redirectToEvent } from "../../../../../actions/Application";
import {
  addInject,
  updateInject,
  deleteInject,
  tryInject,
  injectDone,
  fetchInjectTypesExerciseSimple,
} from "../../../../../actions/Inject";
import InjectForm from "./InjectForm";
import InjectContentForm from "./InjectContentForm";
/* eslint-enable */
import InjectAudiences from './InjectAudiences';
import CopyForm from './CopyForm';

const styles = {
  [Constants.INJECT_EXEC]: {
    position: 'absolute',
    top: '8px',
    right: 0,
  },
  [Constants.INJECT_SCENARIO]: {
    position: 'absolute',
    top: '5px',
    right: 0,
  },
};

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu',
    '3. Audiences': '3. Audiences',
    'Do you want to delete this inject?':
      'Souhaitez-vous supprimer cette injection ?',
    Enable: 'Activer',
    Disable: 'Désactiver',
    Test: 'Tester',
    'Do you want to test this inject?':
      'Souhaitez-vous tester cette injection ?',
    'Do you want to disable this inject?':
      'Souhaitez-vous désactiver cette injection ?',
    'Do you want to enable this inject?':
      'Souhaitez-vous activer cette injection ?',
    'Mark as done': 'Marquer comme fait',
    Done: 'Fait',
    'Do you want to mark this inject as done?':
      'Souhaitez-vous marquer cette injection comme réalisée ?',
    'Inject test result': "Résultat du test d'inject",
    Close: 'Fermer',
  },
});

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      openDisable: false,
      openEnable: false,
      openDone: false,
      openCopy: false,
      openTry: false,
      openResult: false,
      type: undefined,
      stepIndex: 0,
      finished: false,
      injectData: null,
      injectResult: false,
      inject_types: {},
      injectAttachments: R.propOr(
        [],
        'attachments',
        this.readJSON(R.propOr(null, 'inject_content', this.props.inject)),
      ),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  readJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    });
  }

  handlePopoverClose() {
    this.setState({
      openPopover: false,
    });
  }

  handleInitializeInject() {
    this.props.fetchInjectTypesExerciseSimple().then((value) => {
      this.setState({
        inject_types: value.result,
      });
    });
  }

  handleOpenEdit() {
    if (this.state.stepIndex === 0) {
      this.handleInitializeInject();
    }
    this.setState({
      openEdit: true,
    });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false,
      stepIndex: 0,
      finished: false,
      injectData: null,
    });
  }

  onGlobalSubmit(data) {
    this.setState({
      injectData: data,
    });
  }

  onContentSubmit(data) {
    const { injectData } = this.state;
    // eslint-disable-next-line no-param-reassign
    data.attachments = this.state.injectAttachments;
    injectData.inject_content = JSON.stringify(data);
    this.setState({
      injectData,
    });
  }

  onContentAttachmentAdd(file) {
    this.setState({
      injectAttachments: R.append(file, this.state.injectAttachments),
    });
  }

  onContentAttachmentDelete(name, event) {
    event.stopPropagation();
    this.setState({
      injectAttachments: R.filter(
        (a) => a.file_name !== name,
        this.state.injectAttachments,
      ),
    });
  }

  onAudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_audiences = data;
    this.setState({
      injectData,
    });
  }

  onSubaudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_subaudiences = data;
    this.setState({
      injectData,
    });
  }

  onSelectAllAudiences(value) {
    const { injectData } = this.state;
    injectData.inject_all_audiences = value;
    this.setState({
      injectData,
    });
  }

  submitFormEdit() {
    switch (this.state.stepIndex) {
      case 0:
        this.refs.injectForm.submit();
        break;
      case 1:
        this.refs.contentForm.getWrappedInstance().submit();
        break;
      case 2:
        this.updateInject();
        break;
      default:
    }
  }

  updateInject() {
    const data = R.assoc(
      'inject_date',
      dateToISO(this.state.injectData.inject_date),
      this.state.injectData,
    );
    this.props.updateInject(
      this.props.exerciseId,
      this.props.eventId,
      this.props.incidentId,
      this.props.inject.inject_id,
      data,
    );
    this.handleCloseEdit();
  }

  onInjectTypeChange(event, index, value) {
    this.setState({
      type: value,
    });
  }

  handleOpenDelete() {
    this.setState({
      openDelete: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({
      openDelete: false,
    });
  }

  submitDelete() {
    this.props
      .deleteInject(
        this.props.exerciseId,
        this.props.eventId,
        this.props.incidentId,
        this.props.inject.inject_id,
      )
      .then(() => {
        this.props.fetchIncident(
          this.props.exerciseId,
          this.props.eventId,
          this.props.incidentId,
        );
      });
    this.handleCloseDelete();
  }

  handleOpenDisable() {
    this.setState({
      openDisable: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({
      openDisable: false,
    });
  }

  submitDisable() {
    this.props.updateInject(
      this.props.exerciseId,
      this.props.eventId,
      this.props.incidentId,
      this.props.inject.inject_id,
      { inject_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenEnable() {
    this.setState({
      openEnable: true,
    });
    this.handlePopoverClose();
  }

  handleCloseEnable() {
    this.setState({
      openEnable: false,
    });
  }

  submitEnable() {
    this.props.updateInject(
      this.props.exerciseId,
      this.props.eventId,
      this.props.incidentId,
      this.props.inject.inject_id,
      { inject_enabled: true },
    );
    this.handleCloseEnable();
  }

  selectContent() {
    this.setState({
      stepIndex: 1,
    });
  }

  selectAudiences() {
    this.setState({
      stepIndex: 2,
      finished: true,
    });
  }

  handleOpenCopy() {
    this.setState({
      openCopy: true,
    });
    this.handlePopoverClose();
  }

  handleCloseCopy() {
    this.setState({
      openCopy: false,
    });
  }

  submitFormCopy() {
    this.refs.copyForm.submit();
  }

  handleOpenDone() {
    this.setState({
      openDone: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDone() {
    this.setState({
      openDone: false,
    });
  }

  submitDone() {
    this.props.injectDone(this.props.inject.inject_id);
    this.handleCloseDone();
  }

  onCopySubmit(data) {
    const incident = R.find((i) => i.incident_id === data.incident_id)(
      this.props.incidents,
    );
    const audiencesList = R.map(
      (a) => a.audience_id,
      this.props.inject.inject_audiences,
    );
    const subaudiencesList = R.map(
      (a) => a.audience_id,
      this.props.inject.inject_subaudiences,
    );
    const newInject = R.pipe(
      R.dissoc('inject_id'),
      R.dissoc('inject_event'),
      R.dissoc('inject_exercise'),
      R.dissoc('inject_incident'),
      R.dissoc('inject_status'),
      R.dissoc('inject_user'),
      R.dissoc('inject_users_number'),
      R.assoc('inject_title', `${this.props.inject.inject_title} (copy)`),
      R.assoc('inject_audiences', audiencesList),
      R.assoc('inject_subaudiences', subaudiencesList),
    )(this.props.inject);

    this.props
      .addInject(
        this.props.exerciseId,
        incident.incident_event.event_id,
        data.incident_id,
        newInject,
      )
      .then(() => {
        this.props
          .fetchIncident(
            this.props.exerciseId,
            incident.incident_event.event_id,
            data.incident_id,
          )
          .then(() => {
            this.props.redirectToEvent(
              this.props.exerciseId,
              incident.incident_event.event_id,
            );
          });
      });

    this.props.selectIncident(
      this.props.exerciseId,
      incident.incident_event.event_id,
      data.incident_id,
    );
    this.handleCloseCopy();
  }

  handleOpenTry() {
    this.setState({
      openTry: true,
    });
    this.handlePopoverClose();
  }

  handleCloseTry() {
    this.setState({
      openTry: false,
    });
  }

  submitTry() {
    this.props
      .tryInject(
        this.props.exerciseId,
        this.props.eventId,
        this.props.incidentId,
        this.props.inject.inject_id,
      )
      .then((payload) => {
        this.setState({ injectResult: payload.result, openResult: true });
      });
    this.handleCloseTry();
  }

  handleCloseResult() {
    this.setState({
      openResult: false,
    });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  getStepContent(stepIndex, initialValues) {
    switch (stepIndex) {
      case 0:
        /* eslint-disable */
        return (
          <InjectForm
            ref="injectForm"
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectContent.bind(this)}
            initialValues={initialValues}
            onInjectTypeChange={this.onInjectTypeChange.bind(this)}
            types={this.state.inject_types}
          />
        );
      /* eslint-enable */
      case 1:
        /* eslint-disable */
        return (
          <InjectContentForm
            ref="contentForm"
            initialValues={this.readJSON(initialValues.inject_content)}
            types={this.state.inject_types}
            type={
              this.state.type ? this.state.type : this.props.inject.inject_type
            }
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.selectAudiences.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(
              this
            )}
            downloadAttachment={this.downloadAttachment.bind(this)}
            attachments={this.state.injectAttachments}
          />
        );
      /* eslint-enable */
      case 2:
        /* eslint-disable */
        return (
          <InjectAudiences
            ref="injectAudiences"
            exerciseId={this.props.exerciseId}
            eventId={this.props.eventId}
            incidentId={this.props.incidentId}
            onChangeAudiences={this.onAudiencesChange.bind(this)}
            onChangeSubaudiences={this.onSubaudiencesChange.bind(this)}
            onChangeSelectAll={this.onSelectAllAudiences.bind(this)}
            injectId={this.props.inject.inject_id}
            injectAudiencesIds={this.props.injectAudiencesIds}
            injectSubaudiencesIds={this.props.injectSubaudiencesIds}
            audiences={this.props.audiences}
            subaudiences={this.props.subaudiences}
            selectAll={this.props.inject.inject_all_audiences}
          />
        );
      /* eslint-enable */
      default:
        return 'Go away!';
    }
  }

  // eslint-disable-next-line class-methods-use-this
  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor;
    }
    return Theme.palette.textColor;
  }

  render() {
    const injectIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.inject,
    );
    const injectIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.inject,
    );
    const { userCanUpdate } = this.props;

    const editActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      injectIsUpdatable && userCanUpdate ? (
        <FlatButton
          key="update"
          label={this.state.stepIndex === 2 ? 'Update' : 'Next'}
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
      injectIsDeletable && userCanUpdate ? (
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
      injectIsUpdatable && userCanUpdate ? (
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
      injectIsUpdatable && userCanUpdate ? (
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
    const copyActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseCopy.bind(this)}
      />,
      <FlatButton
        key="copy"
        label="Copy"
        primary={true}
        onClick={this.submitFormCopy.bind(this)}
      />,
    ];
    const tryActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseTry.bind(this)}
      />,
      <FlatButton
        key="test"
        label="Test"
        primary={true}
        onClick={this.submitTry.bind(this)}
      />,
    ];
    const doneActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDone.bind(this)}
      />,
      <FlatButton
        key="done"
        label="Done"
        primary={true}
        onClick={this.submitDone.bind(this)}
      />,
    ];
    const resultActions = [
      <FlatButton
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleCloseResult.bind(this)}
      />,
    ];

    const initPipe = R.pipe(
      R.assoc(
        'inject_date_only',
        dayFormat(R.path(['inject', 'inject_date'], this.props)),
      ),
      R.assoc(
        'inject_time',
        timeFormat(R.path(['inject', 'inject_date'], this.props)),
      ),
      R.pick([
        'inject_title',
        'inject_description',
        'inject_content',
        'inject_date_only',
        'inject_time',
        'inject_type',
        'inject_date',
      ]),
    );
    const initialValues = this.props.inject !== undefined ? initPipe(this.props.inject) : undefined;
    const injectEnabled = R.propOr(true, 'inject_enabled', this.props.inject);
    const injectType = R.propOr(true, 'inject_type', this.props.inject);
    const injectNotSupported = !R.propOr(
      false,
      injectType,
      this.props.inject_types,
    );

    if (!userCanUpdate) {
      return '';
    }

    return (
      <div style={styles[this.props.type]}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon
            name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}
            color={this.switchColor(!injectEnabled || injectNotSupported)}
          />
        </IconButton>

        {userCanUpdate ? (
          <Popover
            open={this.state.openPopover}
            anchorEl={this.state.anchorEl}
            onRequestClose={this.handlePopoverClose.bind(this)}
          >
            <Menu multiple={false}>
              {!injectNotSupported ? (
                <MenuItemLink
                  label="Edit"
                  onClick={this.handleOpenEdit.bind(this)}
                />
              ) : (
                ''
              )}
              {!injectNotSupported && this.props.location !== 'run' ? (
                <MenuItemLink
                  label="Copy"
                  onClick={this.handleOpenCopy.bind(this)}
                />
              ) : (
                ''
              )}
              {injectEnabled && !injectNotSupported ? (
                <MenuItemButton
                  label="Disable"
                  onClick={this.handleOpenDisable.bind(this)}
                />
              ) : (
                ''
              )}
              {!injectEnabled && !injectNotSupported ? (
                <MenuItemButton
                  label="Enable"
                  onClick={this.handleOpenEnable.bind(this)}
                />
              ) : (
                ''
              )}
              {injectType === 'openex_manual'
              && this.props.location === 'run' ? (
                <MenuItemButton
                  label="Mark as done"
                  onClick={this.handleOpenDone.bind(this)}
                />
                ) : (
                  ''
                )}
              {!injectNotSupported ? (
                <MenuItemButton
                  label="Test"
                  onClick={this.handleOpenTry.bind(this)}
                />
              ) : (
                ''
              )}
              {injectIsDeletable ? (
                <MenuItemButton
                  label="Delete"
                  onClick={this.handleOpenDelete.bind(this)}
                />
              ) : (
                ''
              )}
            </Menu>
          </Popover>
        ) : (
          ''
        )}

        <DialogTitleElement
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to delete this inject?</T>
        </DialogTitleElement>

        <DialogTitleElement
          title={
            <Stepper linear={false} activeStep={this.state.stepIndex}>
              <Step>
                <StepLabel>
                  <T>1. Parameters</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>2. Content</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>3. Audiences</T>
                </StepLabel>
              </Step>
            </Stepper>
          }
          autoScrollBodyContent={true}
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <div>{this.getStepContent(this.state.stepIndex, initialValues)}</div>
        </DialogTitleElement>

        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDisable}
          onRequestClose={this.handleCloseDisable.bind(this)}
          actions={disableActions}
        >
          <T>Do you want to disable this inject?</T>
        </Dialog>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openEnable}
          onRequestClose={this.handleCloseEnable.bind(this)}
          actions={enableActions}
        >
          <T>Do you want to enable this inject?</T>
        </Dialog>
        <Dialog
          title="Done"
          modal={false}
          open={this.state.openDone}
          onRequestClose={this.handleCloseDone.bind(this)}
          actions={doneActions}
        >
          <T>Do you want to mark this inject as done?</T>
        </Dialog>
        <Dialog
          title="Copy"
          modal={false}
          open={this.state.openCopy}
          onRequestClose={this.handleCloseCopy.bind(this)}
          actions={copyActions}
        >
          {/* eslint-disable */}
          <CopyForm
            ref="copyForm"
            incidents={this.props.incidents}
            onSubmit={this.onCopySubmit.bind(this)}
            onSubmitSuccess={this.handleCloseCopy.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
        <Dialog
          title="Test"
          modal={false}
          open={this.state.openTry}
          onRequestClose={this.handleCloseTry.bind(this)}
          actions={tryActions}
        >
          <T>Do you want to test this inject?</T>
        </Dialog>
        <Dialog
          title="Inject test result"
          modal={false}
          open={this.state.openResult}
          onRequestClose={this.handleCloseResult.bind(this)}
          actions={resultActions}
        >
          <div>
            <div>
              <strong>
                {this.state.injectResult ? this.state.injectResult.status : ''}
              </strong>
            </div>
            <br />
            {this.state.injectResult && this.state.injectResult.message
              ? this.state.injectResult.message.map((line) => (
                  <div key={Math.random()}>{line}</div>
              ))
              : ''}
          </div>
        </Dialog>
      </div>
    );
  }
}

InjectPopover.propTypes = {
  fetchInjectTypesExerciseSimple: PropTypes.func,
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  inject: PropTypes.object,
  injectAudiencesIds: PropTypes.array,
  injectSubaudiencesIds: PropTypes.array,
  fetchIncident: PropTypes.func,
  addInject: PropTypes.func,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  tryInject: PropTypes.func,
  redirectToEvent: PropTypes.func,
  selectIncident: PropTypes.func,
  injectDone: PropTypes.func,
  inject_types: PropTypes.object,
  children: PropTypes.node,
  initialAttachments: PropTypes.array,
  type: PropTypes.string,
  incidents: PropTypes.array,
  location: PropTypes.string,
  downloadFile: PropTypes.func,
  userCanUpdate: PropTypes.bool,
};

export default connect(null, {
  fetchIncident,
  addInject,
  updateInject,
  deleteInject,
  injectDone,
  tryInject,
  redirectToEvent,
  selectIncident,
  downloadFile,
  fetchInjectTypesExerciseSimple,
})(InjectPopover);
