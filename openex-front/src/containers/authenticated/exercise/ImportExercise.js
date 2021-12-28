import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import IconButton from '@mui/material/IconButton';
import { CloudUploadOutlined } from '@mui/icons-material';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Slide from '@mui/material/Slide';
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import {
  updateExercise,
  deleteExercise,
  exportExercise,
  importExercise,
  fetchExercise,
  checkIfExerciseNameExist,
} from '../../../actions/Exercise';
import { addFile, getImportFileSheetsName } from '../../../actions/File';
import { downloadDocument } from '../../../actions/Document';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

i18nRegister({
  fr: {
    'Import an exercise': 'Importer un exercice',
  },
});

const styles = () => ({
  import: {
    color: '#ffffff',
    position: 'absolute',
    top: 8,
    right: 130,
  },
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
});

class CreateExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAudience: false,
      openAddUsers: false,
      openInject: false,
      searchTerm: '',
      users: [],
      openImport: false,
      openSelect: false,
      exerciseNameExist: false,
      exerciseData: null,
      audienceData: null,
      eventData: null,
      incidentData: null,
      usersData: null,
      incidentType: null,
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

  handleCreate() {
    this.handleClose();
    this.handleCloseSelect();
    this.handleOpenAudience();
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
      // eslint-disable-next-line no-alert
      alert(
        "Il est impossible d'importer les audiences sans importer l'exercice",
      );
    } else if (
      dataToImport.objective === '1'
      && dataToImport.exercise === '0'
    ) {
      // eslint-disable-next-line no-alert
      alert(
        "Il est impossible d'importer les objectifs sans importer l'exercice",
      );
    } else if (
      dataToImport.scenarios === '1'
      && dataToImport.exercise === '0'
    ) {
      // eslint-disable-next-line no-alert
      alert(
        "Il est impossible d'importer les scénarios sans importer l'exercice",
      );
    } else if (
      dataToImport.incidents === '1'
      && (dataToImport.scenarios === 0 || dataToImport.exercise === '0')
    ) {
      // eslint-disable-next-line no-alert
      alert(
        "Il est impossible d'importer les incidents sans importer l'exercice et les scénarios",
      );
    } else if (
      dataToImport.injects === '1'
      && (dataToImport.incidents === 0
        || dataToImport.scenarios === 0
        || dataToImport.exercise === '0')
    ) {
      // eslint-disable-next-line no-alert
      alert(
        "Il est impossible d'importer les incidents sans importer l'exercice, les scénarios et les incidents",
      );
    } else {
      this.setState({ openImport: false });
      this.props
        .importExercise(fileData.file_id, dataToImport)
        .then((result) => {
          if (result.result.success === true) {
            // eslint-disable-next-line no-alert
            alert('Import terminé avec succès');
            window.location.reload();
          } else {
            // eslint-disable-next-line no-alert
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
      this.props
        .getImportFileSheetsName(file.result)
        .then((fileSheets) => {
          this.props
            .checkIfExerciseNameExist(file.result)
            .then((exerciseExistResult) => {
              this.handleOpenImport(
                fileSheets.result,
                exerciseExistResult.result.exercise_exist,
              );
            })
            .catch((error) => {
              // eslint-disable-next-line no-alert
              alert(error.message);
            });
        })
        .catch((error) => {
          // eslint-disable-next-line no-alert
          alert(error.message);
        });
    });
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

  onContentAttachmentDelete(name, event) {
    event.stopPropagation();
    this.setState({
      injectAttachments: R.filter(
        (a) => a.document_name !== name,
        this.state.injectAttachments,
      ),
    });
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

  selectContent() {
    this.setState({ stepIndex: 1 });
  }

  downloadAttachment(documentId, documentName) {
    return this.props.downloadDocument(documentId, documentName);
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <IconButton
          className={classes.import}
          onClick={this.openFileDialog.bind(this)}
          size="large">
          <CloudUploadOutlined fontSize="default" />
        </IconButton>
        <input
          type="file"
          ref="fileUpload"
          style={{ display: 'none' }}
          onChange={this.handleFileChange.bind(this)}
        />
        <Dialog
          open={this.state.openImport}
          TransitionComponent={Transition}
          onClose={this.handleCloseImport.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            <T>Import an exercise</T>
          </DialogTitle>
          <DialogContent>
            {this.state.exerciseNameExist === true && (
              <div style={styles.divWarning}>
                <T>
                  Be careful, you already have an exercise with the same name.
                  If you import it, it will be updated/overwritten.
                </T>
              </div>
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
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseImport.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => this.submitImport()}
            >
              <T>Create</T>
            </Button>
          </DialogActions>
        </Dialog>
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
  addEvent: PropTypes.func,
  addIncident: PropTypes.func,
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
  downloadAttachment: PropTypes.func,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, {
    fetchExercise,
    downloadDocument,
    addFile,
    getImportFileSheetsName,
    updateExercise,
    deleteExercise,
    exportExercise,
    importExercise,
    checkIfExerciseNameExist,
  }),
  withStyles(styles),
)(CreateExercise);
