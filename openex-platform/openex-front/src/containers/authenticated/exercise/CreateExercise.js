import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import * as R from 'ramda';
import { T } from '../../../components/I18n';
import * as Constants from '../../../constants/ComponentTypes';
import { i18nRegister } from '../../../utils/Messages';
/* eslint-disable */
import {
  addExercise,
  updateExercise,
  deleteExercise,
  exportExercise,
  importExercise,
  exportInjectEml,
  fetchExercise,
  checkIfExerciseNameExist,
} from "../../../actions/Exercise";
import { addFile, getImportFileSheetsName } from "../../../actions/File";
import { downloadDocument } from "../../../actions/Document";
import { Dialog, DialogTitleElement } from "../../../components/Dialog";
import { Checkbox } from "../../../components/Checkbox";
import {
  FlatButton,
  FloatingActionsButtonCreate,
} from "../../../components/Button";
import SelectExercise from "./SelectExercise";
import AudienceForm from "./audiences/audience/AudienceForm";
import ExerciseForm from "./ExerciseForm";
import { SimpleTextField } from "../../../components/SimpleTextField";
import { Chip } from "../../../components/Chip";
import { Avatar } from "../../../components/Avatar";
import { List } from "../../../components/List";
import { MainSmallListItem } from "../../../components/list/ListItem";
import {
  addAudience,
  fetchAudiences,
  fetchAudience,
} from "../../../actions/Audience";
import {
  addSubaudience,
  updateSubaudience,
  fetchSubaudiences,
} from "../../../actions/Subaudience";
import {
  addInject,
  fetchInjectTypesExerciseSimple,
} from "../../../actions/Inject";
import { addEvent } from "../../../actions/Event";
import { addIncident, fetchIncidentTypes } from "../../../actions/Incident";
import InjectForm from "./scenario/event/InjectForm";
import InjectContentForm from "./scenario/event/InjectContentForm";
import { dateToISO } from "../../../utils/Time";
/* eslint-enable */
import { Step, StepLabel, Stepper } from '../../../components/Stepper';

i18nRegister({
  fr: {
    'Create a new simple exercise': 'Créer un exercice simple',
    'Create a new standard exercise': 'Créer un exercice standard',
    'Create a new audience': 'Créer une audience',
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu',
  },
});

const styles = {
  divWarning: {
    border: '2px #FFBF00 solid',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    marginBottom: '10px',
    fontWeight: '400',
    backgroundColor: '#F5DA81',
    textAlign: 'center',
  },
  name: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mail: {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  org: {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  select: {
    textAlign: 'center',
  },
};

class CreateExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openExercise: false,
      openStandardExercise: false,
      openAudience: false,
      openSubaudience: false,
      openAddUsers: false,
      openInject: false,
      searchTerm: '',
      users: [],
      openImport: false,
      openSelect: false,
      exerciseNameExist: false,
      exerciseData: null,
      audienceData: null,
      subaudienceData: null,
      eventData: null,
      incidentData: null,
      usersData: null,
      incidentType: null,
      subaudienceUsersIds: [],
      file: {
        file_id: '0',
      },
      typesToImport: {
        exercise: '1',
        audience: '1',
        objective: '1',
        scenarios: '1',
        incidents: '1',
        injects: '1',
      },
      dataToImport: {
        exercise: '0',
        audience: '0',
        objective: '0',
        scenarios: '0',
        incidents: '0',
        injects: '0',
      },
      typeExercise: null,
      open: false,
      stepIndex: 0,
      finished: false,
      inject_types: {},
      type: 'openex_manual',
      injectData: null,
      injectAttachments: [],
    };
  }

  handleOpenImport(data, exerciseExist) {
    data.map((value) => {
      const { dataToImport } = this.state;
      dataToImport[value] = '1';
      this.setState({
        exerciseNameExist: exerciseExist,
        dataToImport,
      });
      return value;
    });
    this.setState({ openImport: true });
  }

  handleOpen() {
    this.setState({ openExercise: true });
  }

  handleSelectStandardExercise() {
    this.setState({ openStandardExercise: true });
  }

  handleClose() {
    this.setState({ openExercise: false });
  }

  handleCloseStandardExercise() {
    this.handleCloseSelect();
    this.setState({ openStandardExercise: false });
  }

  handleCreate() {
    this.handleClose();
    this.handleCloseSelect();
    this.handleOpenAudience();
  }

  onSubmit(data) {
    // eslint-disable-next-line no-param-reassign
    data.exercise_start_date = this.convertDate(
      `${data.exercise_start_date_only} ${data.exercise_start_time}`,
    );
    // eslint-disable-next-line no-param-reassign
    data.exercise_end_date = this.convertDate(
      `${data.exercise_end_date_only} ${data.exercise_end_time}`,
    );
    // eslint-disable-next-line no-param-reassign
    data.exercise_type = 'simple';
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_start_date_only;
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_start_time;
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_end_date_only;
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_end_time;
    this.setState({ exerciseData: data });
  }

  onSubmitStandardExercise(data) {
    // eslint-disable-next-line no-param-reassign
    data.exercise_start_date = this.convertDate(
      `${data.exercise_start_date_only} ${data.exercise_start_time}`,
    );
    // eslint-disable-next-line no-param-reassign
    data.exercise_end_date = this.convertDate(
      `${data.exercise_end_date_only} ${data.exercise_end_time}`,
    );
    // eslint-disable-next-line no-param-reassign
    data.exercise_type = 'standard';
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_start_date_only;
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_start_time;
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_end_date_only;
    // eslint-disable-next-line no-param-reassign
    delete data.exercise_end_time;
    return this.props.addExercise(data);
  }

  submitForm() {
    // eslint-disable-next-line react/no-string-refs
    this.refs.exerciseForm.submit();
  }

  handleCloseImport() {
    this.setState({
      dataToImport: {
        exercise: '0',
        audience: '0',
        objective: '0',
        scenarios: '0',
        incidents: '0',
        injects: '0',
      },
      openImport: false,
      exerciseNameExist: false,
    });
  }

  handleImportCheck(type, event, isChecked) {
    const { typesToImport } = this.state;
    if (isChecked) {
      typesToImport[type] = '1';
    } else {
      typesToImport[type] = '0';
    }
    this.setState({ typesToImport });
  }

  submitImport() {
    const dataToImport = this.state.typesToImport;
    const fileData = this.state.file;
    if (dataToImport.audience === '1' && dataToImport.exercise === '0') {
      alert(
        "Il est impossible d'importer les audiences sans importer l'exercice",
      );
    } else if (
      dataToImport.objective === '1'
      && dataToImport.exercise === '0'
    ) {
      alert(
        "Il est impossible d'importer les objectifs sans importer l'exercice",
      );
    } else if (
      dataToImport.scenarios === '1'
      && dataToImport.exercise === '0'
    ) {
      alert(
        "Il est impossible d'importer les scénarios sans importer l'exercice",
      );
    } else if (
      dataToImport.incidents === '1'
      && (dataToImport.scenarios === 0 || dataToImport.exercise === '0')
    ) {
      alert(
        "Il est impossible d'importer les incidents sans importer l'exercice et les scénarios",
      );
    } else if (
      dataToImport.injects === '1'
      && (dataToImport.incidents === 0
        || dataToImport.scenarios === 0
        || dataToImport.exercise === '0')
    ) {
      alert(
        "Il est impossible d'importer les incidents sans importer l'exercice, les scénarios et les incidents",
      );
    } else {
      this.setState({ openImport: false });
      this.props
        .importExercise(fileData.file_id, dataToImport)
        .then((result) => {
          if (result.result.success === true) {
            alert('Import terminé avec succès');
            window.location.reload();
          } else {
            alert(result.result.errorMessage);
          }
        });
    }
  }

  // eslint-disable-next-line consistent-return,class-methods-use-this
  convertDate(dateToConvert) {
    const regexDateFr = RegExp(
      '^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$',
    );
    const regexDateEn = RegExp(
      '^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$',
    );
    let timeSplitted;
    let dateSplitted;
    let split;
    let newDate;
    if (regexDateFr.test(dateToConvert)) {
      split = dateToConvert.split(' ');
      dateSplitted = split[0].split('/');
      // eslint-disable-next-line prefer-destructuring
      timeSplitted = split[1];
      newDate = `${dateSplitted[2]}-${dateSplitted[1]}-${dateSplitted[0]} ${timeSplitted}`;
      return newDate;
    }
    if (regexDateEn.test(dateToConvert)) {
      return dateToConvert;
    }
  }

  openFileDialog() {
    // eslint-disable-next-line react/no-string-refs
    this.refs.fileUpload.click();
  }

  importExercise() {
    this.setState({
      openExercise: false,
      openImport: true,
    });
  }

  handleFileChange() {
    const data = new FormData();
    // eslint-disable-next-line react/no-string-refs
    data.append('file', this.refs.fileUpload.files[0]);
    this.props.addFile(data).then((file) => {
      const fileData = {
        file_id: file.result,
      };
      this.setState({ file: fileData });
      this.props.getImportFileSheetsName(file.result).then((fileSheets) => {
        this.props
          .checkIfExerciseNameExist(file.result)
          .then((exerciseExistResult) => {
            this.handleOpenImport(
              fileSheets.result,
              exerciseExistResult.result.exercise_exist,
            );
          });
      });
    });
  }

  handleOpenAudience() {
    this.setState({ openAudience: true });
  }

  handleCloseAudience() {
    this.setState({ openAudience: false });
  }

  onSubmitAudience(data) {
    this.setState({ audienceData: data });
    const subaudience = {
      exercise_mail_expediteur: 'animation@domaine.fr',
      subaudience_name: 'sous audience',
    };
    this.setState({ subaudienceData: subaudience });
    this.handleInitializeEvent();
    this.handleInitializeIncident();
  }

  handleInitializeEvent() {
    const event = {
      event_title: 'événement',
      event_description: 'événement',
    };
    this.setState({ eventData: event });
  }

  handleInitializeIncident() {
    this.props.fetchIncidentTypes().then((value) => {
      if (value.result.length !== 0) {
        const incident = {
          incident_title: 'incident',
          incident_type: value.result[0],
          incident_weight: 3,
          incident_story: 'incident',
        };
        this.setState({ incidentData: incident });
      }
    });
  }

  handleCreateAudience() {
    this.handleCloseAudience();
    this.handleOpenAddUsers();
  }

  submitFormAudience() {
    // eslint-disable-next-line react/no-string-refs
    this.refs.audienceForm.submit();
  }

  handleOpenAddUsers() {
    this.setState({ openAddUsers: true });
  }

  handleCloseAddUsers() {
    this.setState({
      openAddUsers: false,
      searchTerm: '',
      users: [],
    });
  }

  handleSearchUsers(event, value) {
    this.setState({ searchTerm: value });
  }

  submitAddUsers() {
    const usersList = R.pipe(
      R.map((u) => u.user_id),
      R.concat(this.state.subaudienceUsersIds),
    )(this.state.users);
    this.setState({ usersData: usersList });
    this.handleInitializeInject();
    this.handleOpenInject();
    this.handleCloseAddUsers();
  }

  handleInitializeInject() {
    this.props.fetchInjectTypesExerciseSimple().then((value) => {
      this.setState({ inject_types: value.result });
    });
  }

  addUser(user) {
    if (
      !this.state.subaudienceUsersIds.includes(user.user_id)
      && !this.state.users.includes(user)
    ) {
      this.setState({ users: R.append(user, this.state.users) });
    }
  }

  removeUser(user) {
    this.setState({
      users: R.filter((u) => u.user_id !== user.user_id, this.state.users),
    });
  }

  handleOpenSelect() {
    this.setState({ openSelect: true });
  }

  handleCloseSelect() {
    this.setState({ openSelect: false });
  }

  handleSelectSimpleExercise() {
    this.handleOpen();
  }

  handleOpenInject() {
    this.setState({ openInject: true });
  }

  handleCloseInject() {
    this.setState({
      openInject: false,
      stepIndex: 0,
      finished: false,
      type: 'openex_manual',
      injectData: null,
      injectAttachments: [],
    });
  }

  onGlobalSubmit(data) {
    // eslint-disable-next-line no-param-reassign
    data.inject_date = this.convertDateInject(
      `${data.inject_date_only} ${data.inject_time}`,
    );
    // eslint-disable-next-line no-param-reassign
    delete data.inject_date_only;
    // eslint-disable-next-line no-param-reassign
    delete data.inject_time;
    this.setState({ injectData: data });
  }

  // eslint-disable-next-line consistent-return,class-methods-use-this
  convertDateInject(dateToConvert) {
    const regexDateFr = RegExp(
      '^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$',
    );
    const regexDateEn = RegExp(
      '^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$',
    );
    let timeSplitted;
    let dateSplitted;
    let split;
    let newDate;
    if (regexDateFr.test(dateToConvert)) {
      split = dateToConvert.split(' ');
      dateSplitted = split[0].split('/');
      // eslint-disable-next-line prefer-destructuring
      timeSplitted = split[1];
      newDate = `${dateSplitted[2]}-${dateSplitted[1]}-${dateSplitted[0]} ${timeSplitted}`;
      return newDate;
    }
    if (regexDateEn.test(dateToConvert)) {
      return dateToConvert;
    }
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
        (a) => a.document_name !== name,
        this.state.injectAttachments,
      ),
    });
  }

  onContentSubmit(data) {
    const { injectData } = this.state;
    // eslint-disable-next-line no-param-reassign
    data.attachments = this.state.injectAttachments;
    injectData.inject_content = JSON.stringify(data);
    this.setState({ injectData });
  }

  onAudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_audiences = data;
    this.setState({ injectData });
  }

  onSubaudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_subaudiences = data;
    this.setState({ injectData });
  }

  handleNext() {
    if (this.state.stepIndex === 0) {
      // eslint-disable-next-line react/no-string-refs
      this.refs.injectForm.submit();
    } else if (this.state.stepIndex === 1) {
      // eslint-disable-next-line react/no-string-refs
      this.refs.contentForm.getWrappedInstance().submit();
    }
  }

  createInject() {
    // creation d'un exercice et recuperation de son Id
    this.props.addExercise(this.state.exerciseData).then((value) => {
      const exerciseId = value.result;

      // creation de l'audience correspondante et recuperation de son Id
      this.props
        .addAudience(exerciseId, this.state.audienceData)
        .then((subValue) => {
          const audienceId = subValue.result;
          // creation de la sous-audience correspondante et recuperation de son Id
          this.props
            .addSubaudience(exerciseId, audienceId, this.state.subaudienceData)
            .then((subSubValue) => {
              const subaudienceId = subSubValue.result;
              this.props.updateSubaudience(
                exerciseId,
                audienceId,
                subaudienceId,
                {
                  subaudience_users: this.state.usersData,
                },
              );

              // creation de l'evenement correspondant et recuperation de son Id
              this.props
                .addEvent(exerciseId, this.state.eventData)
                .then((subSubSubValue) => {
                  const eventId = subSubSubValue.result;
                  // creation de l'incident correspondant et recuperation de son Id
                  this.props
                    .addIncident(exerciseId, eventId, this.state.incidentData)
                    .then((subSubSubSubValue) => {
                      const incidentId = subSubSubSubValue.result;
                      // ajout de l'audience et de la sous-audience
                      this.onAudiencesChange([audienceId]);
                      this.onSubaudiencesChange([]);
                      // construction de l'inject
                      const data = R.assoc(
                        'inject_date',
                        dateToISO(this.state.injectData.inject_date),
                        this.state.injectData,
                      );
                      // creation de l'inject
                      this.props.addInject(
                        exerciseId,
                        eventId,
                        incidentId,
                        data,
                      );
                      this.handleCloseInject();
                    });
                });
            });
        });
    });
  }

  onInjectTypeChange(event, index, value) {
    this.setState({ type: value });
  }

  selectContent() {
    this.setState({ stepIndex: 1 });
  }

  downloadAttachment(documentId, documentName) {
    return this.props.downloadDocument(documentId, documentName);
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        /* eslint-disable */
        return (
          <InjectForm
            ref="injectForm"
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectContent.bind(this)}
            onInjectTypeChange={this.onInjectTypeChange.bind(this)}
            initialValues={{ inject_type: "openex_manual" }}
            types={this.state.inject_types}
          />
        );
      /* eslint-enable */
      case 1:
        /* eslint-disable */
        return (
          <InjectContentForm
            ref="contentForm"
            types={this.state.inject_types}
            type={this.state.type}
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.createInject.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(
              this
            )}
            downloadAttachment={this.downloadAttachment.bind(this)}
            attachments={this.state.injectAttachments}
          />
        );
      /* eslint-enable */
      default:
        return 'Go away!';
    }
  }

  render() {
    const exerciseSimpleActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleClose.bind(this)}
      />,
      <FlatButton
        key="create"
        label="Create"
        primary={true}
        onClick={this.submitForm.bind(this)}
      />,
    ];

    const exerciseStandardActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseStandardExercise.bind(this)}
      />,
      <FlatButton
        key="create"
        label="Create"
        primary={true}
        onClick={this.submitForm.bind(this)}
      />,
    ];

    const importActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseImport.bind(this)}
      />,
      <FlatButton
        key="export"
        label="Import"
        primary={true}
        onClick={this.submitImport.bind(this)}
      />,
    ];

    const audienceActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseAudience.bind(this)}
      />,
      <FlatButton
        key="next"
        label="Next"
        primary={true}
        onClick={this.submitFormAudience.bind(this)}
      />,
    ];

    const addUsersActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseAddUsers.bind(this)}
      />,
      <FlatButton
        key="add"
        label="Add these users"
        primary={true}
        onClick={this.submitAddUsers.bind(this)}
      />,
    ];

    const injectActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseInject.bind(this)}
      />,
      <FlatButton
        key="create"
        label={this.state.stepIndex === 1 ? 'Create' : 'Next'}
        primary={true}
        onClick={this.handleNext.bind(this)}
      />,
    ];

    const informationValues = {
      exercise_mail_expediteur: 'animation@domaine.fr',
    };

    // region filter users by active keyword
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const filteredUsers = R.filter(filterByKeyword, R.values(this.props.users));
    // endregion

    return (
      <div>
        {/* eslint-disable */}
        <input
          type="file"
          ref="fileUpload"
          style={{ display: "none" }}
          onChange={this.handleFileChange.bind(this)}
        />
        {/* eslint-enable */}
        <FloatingActionsButtonCreate
          type={Constants.BUTTON_TYPE_FLOATING}
          onClick={this.handleOpenSelect.bind(this)}
        />
        <Dialog
          title="Sélectionner le type d'exercice"
          modal={false}
          open={this.state.openSelect}
          onRequestClose={this.handleCloseSelect.bind(this)}
        >
          <SelectExercise
            onSubmit={this.handleCloseSelect.bind(this)}
            createStandardExercise={this.handleSelectStandardExercise.bind(
              this,
            )}
            createSimpleExercise={this.handleSelectSimpleExercise.bind(this)}
            closeSelect={this.handleCloseSelect.bind(this)}
            importExercise={this.openFileDialog.bind(this)}
          />
        </Dialog>
        <Dialog
          title="Create a new simple exercise"
          modal={false}
          open={this.state.openExercise}
          onRequestClose={this.handleClose.bind(this)}
          actions={exerciseSimpleActions}
        >
          {/* eslint-disable */}
          <ExerciseForm
            ref="exerciseForm"
            onSubmit={this.onSubmit.bind(this)}
            onSubmitSuccess={this.handleCreate.bind(this)}
            initialValues={informationValues}
          />
          {/* eslint-enable */}
        </Dialog>
        <Dialog
          title="Create a new standard exercise"
          modal={false}
          open={this.state.openStandardExercise}
          onRequestClose={this.handleCloseStandardExercise.bind(this)}
          actions={exerciseStandardActions}
        >
          {/* eslint-disable */}
          <ExerciseForm
            ref="exerciseForm"
            onSubmit={this.onSubmitStandardExercise.bind(this)}
            onSubmitSuccess={this.handleCloseStandardExercise.bind(this)}
            initialValues={informationValues}
          />
          {/* eslint-enable */}
        </Dialog>
        <Dialog
          title="Importer un exercice"
          modal={true}
          open={this.state.openImport}
          onRequestClose={this.handleCloseImport.bind(this)}
          actions={importActions}
        >
          {this.state.exerciseNameExist === true ? (
            <div style={styles.divWarning}>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              Attention, vous êtes déja le propriétaire d'un exercice portant le
              même nom.
              <br />
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              En cas d'import votre exercice sera mis à jour.
            </div>
          ) : (
            ''
          )}
          <T>Please, chose data to import</T>
          <Table selectable={true} style={{ marginTop: '5px' }}>
            <TableHead adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableCell width="30">
                  <T>Import</T>
                </TableCell>
                <TableCell width="130">
                  <T>Items</T>
                </TableCell>
                <TableCell>
                  <T>Description</T>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody displayRowCheckbox={false}>
              {this.state.dataToImport.exercise === '1' ? (
                <TableRow key="tab-exercise">
                  <TableCell width="30">
                    <Checkbox
                      defaultChecked={true}
                      name="chk-import-exercise"
                      onCheck={this.handleImportCheck.bind(this, 'exercise')}
                    />
                  </TableCell>
                  <TableCell width="130">Exercise</TableCell>
                  <TableCell>Import data from exercise sheet</TableCell>
                </TableRow>
              ) : (
                ''
              )}
              {this.state.dataToImport.audience === '1' ? (
                <TableRow key="tab-audiences">
                  <TableCell width="30">
                    <Checkbox
                      defaultChecked={true}
                      name="chk-import-audience"
                      onCheck={this.handleImportCheck.bind(this, 'audience')}
                    />
                  </TableCell>
                  <TableCell width="130">Audiences</TableCell>
                  <TableCell>Import data from audience sheet</TableCell>
                </TableRow>
              ) : (
                ''
              )}
              {this.state.dataToImport.objective === '1' ? (
                <TableRow key="tab-objective">
                  <TableCell width="30">
                    <Checkbox
                      defaultChecked={true}
                      name="chk-import-objective"
                      onCheck={this.handleImportCheck.bind(this, 'objective')}
                    />
                  </TableCell>
                  <TableCell width="130">Objective</TableCell>
                  <TableCell>Import data from objective sheet</TableCell>
                </TableRow>
              ) : (
                ''
              )}
              {this.state.dataToImport.scenarios === '1' ? (
                <TableRow key="tab-scenarios">
                  <TableCell width="30">
                    <Checkbox
                      defaultChecked={true}
                      name="chk-import-scenarios"
                      onCheck={this.handleImportCheck.bind(this, 'scenarios')}
                    />
                  </TableCell>
                  <TableCell width="130">Events</TableCell>
                  <TableCell>Import data from events sheet</TableCell>
                </TableRow>
              ) : (
                ''
              )}
              {this.state.dataToImport.incidents === '1' ? (
                <TableRow key="tab-incidents">
                  <TableCell width="30">
                    <Checkbox
                      defaultChecked={true}
                      name="chk-import-incidents"
                      onCheck={this.handleImportCheck.bind(this, 'incidents')}
                    />
                  </TableCell>
                  <TableCell width="130">Incidents</TableCell>
                  <TableCell>Import data from incident sheet</TableCell>
                </TableRow>
              ) : (
                ''
              )}
              {this.state.dataToImport.injects === '1' ? (
                <TableRow key="tab-injects">
                  <TableCell width="30">
                    <Checkbox
                      defaultChecked={true}
                      name="chk-import-injects"
                      onCheck={this.handleImportCheck.bind(this, 'injects')}
                    />
                  </TableCell>
                  <TableCell width="130">Injects</TableCell>
                  <TableCell>Import data from injects sheet</TableCell>
                </TableRow>
              ) : (
                ''
              )}
            </TableBody>
          </Table>
        </Dialog>
        <Dialog
          title="Create a new audience"
          modal={false}
          open={this.state.openAudience}
          onRequestClose={this.handleCloseAudience.bind(this)}
          actions={audienceActions}
        >
          {/* eslint-disable */}
          <AudienceForm
            ref="audienceForm"
            onSubmit={this.onSubmitAudience.bind(this)}
            onSubmitSuccess={this.handleCreateAudience.bind(this)}
            initialValues={informationValues}
          />
          {/* eslint-enable */}
        </Dialog>
        <DialogTitleElement
          title={
            <SimpleTextField
              name="keyword"
              fullWidth={true}
              type="text"
              hintText="Search for a user"
              onChange={this.handleSearchUsers.bind(this)}
              styletype={Constants.FIELD_TYPE_INTITLE}
            />
          }
          modal={false}
          open={this.state.openAddUsers}
          onRequestClose={this.handleCloseAddUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={addUsersActions}
        >
          <div>
            {this.state.users.map((user) => (
              <Chip
                key={user.user_id}
                onRequestDelete={this.removeUser.bind(this, user)}
                type={Constants.CHIP_TYPE_LIST}
              >
                <Avatar
                  src={user.user_gravatar}
                  size={32}
                  type={Constants.AVATAR_TYPE_CHIP}
                />
                {user.user_firstname} {user.user_lastname}
              </Chip>
            ))}
            <div className="clearfix"></div>
          </div>
          <div>
            <List>
              {R.take(10, filteredUsers).map((user) => {
                const disabled = R.find(
                  (u) => u.user_id === user.user_id,
                  this.state.users,
                ) !== undefined
                  || this.state.subaudienceUsersIds.includes(user.user_id);
                const userOrganization = R.propOr(
                  {},
                  user.user_organization,
                  this.props.organizations,
                );
                const organizationName = R.propOr(
                  '-',
                  'organization_name',
                  userOrganization,
                );
                return (
                  <MainSmallListItem
                    key={user.user_id}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user)}
                    primaryText={
                      <div>
                        <div style={styles.name}>
                          {user.user_firstname} {user.user_lastname}
                        </div>
                        <div style={styles.mail}>{user.user_email}</div>
                        <div style={styles.org}>{organizationName}</div>
                        <div className="clearfix" />
                      </div>
                    }
                    leftAvatar={
                      <Avatar
                        type={Constants.AVATAR_TYPE_LIST}
                        src={user.user_gravatar}
                      />
                    }
                  />
                );
              })}
            </List>
          </div>
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
            </Stepper>
          }
          modal={false}
          open={this.state.openInject}
          onRequestClose={this.handleClose.bind(this)}
          autoScrollBodyContent={true}
          actions={injectActions}
        >
          <div>{this.getStepContent(this.state.stepIndex)}</div>
        </DialogTitleElement>
      </div>
    );
  }
}

CreateExercise.propTypes = {
  addExercise: PropTypes.func,
  fetchExercise: PropTypes.func,
  addAudience: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchAudience: PropTypes.func,
  addSubaudience: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  addEvent: PropTypes.func,
  addIncident: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  addInject: PropTypes.func,
  fetchInjectTypesExerciseSimple: PropTypes.func,
  addFile: PropTypes.func,
  getImportFileSheetsName: PropTypes.func,
  updateExercise: PropTypes.func,
  deleteExercise: PropTypes.func,
  exportExercise: PropTypes.func,
  importExercise: PropTypes.func,
  exportInjectEml: PropTypes.func,
  checkIfExerciseNameExist: PropTypes.func,
  organizations: PropTypes.object,
  users: PropTypes.object,
  updateSubaudience: PropTypes.func,
  downloadAttachment: PropTypes.func,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default connect(select, {
  addExercise,
  fetchExercise,
  addAudience,
  fetchAudiences,
  fetchAudience,
  addSubaudience,
  fetchSubaudiences,
  downloadDocument,
  addEvent,
  addIncident,
  fetchIncidentTypes,
  addInject,
  fetchInjectTypesExerciseSimple,
  addFile,
  getImportFileSheetsName,
  updateExercise,
  deleteExercise,
  exportExercise,
  importExercise,
  exportInjectEml,
  checkIfExerciseNameExist,
  updateSubaudience,
})(CreateExercise);
