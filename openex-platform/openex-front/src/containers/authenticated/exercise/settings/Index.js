import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import Slide from '@material-ui/core/Slide';
import {
  deleteExercise,
  exportExercise,
  exportInjectEml,
  updateExercise,
} from '../../../../actions/Exercise';
import { shiftAllInjects } from '../../../../actions/Inject';
import { fetchGroups } from '../../../../actions/Group';
import { redirectToHome } from '../../../../actions/Application';
import { Image } from '../../../../components/Image';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import TemplateForm from './TemplateForm';
import ExerciseForm from '../ExerciseForm';
import FileGallery from '../../FileGallery';
import { dateToISO } from '../../../../utils/Time';
import { addFile, getImportFileSheetsName } from '../../../../actions/File';
import { submitForm } from '../../../../utils/Action';

i18nRegister({
  fr: {
    'Start date': 'Date de début',
    'End date': 'Date de fin',
    Subtitle: 'Sous-titre',
    'Change the image': "Changer l'image",
    'Messages template': 'Modèle des messages',
    'Do you want to delete this exercise?':
      'Souhaitez-vous supprimer cet exercice ?',
    'Deleting an exercise will result in deleting all its content, including objectives, events, incidents, injects and audience. We do not recommend you do this.':
      'Supprimer un exercice conduit à la suppression de son contenu, incluant ses objectifs, événéments, incidents, injects et audiences. Nous vous déconseillons de faire cela.',
    'You changed the start date of the exercise, do you want to reschedule all injects relatively to the difference with the original start date?':
      "Vous avez changé la date du début de l'exercice, souhaitez-vous replanifier toutes les injections relativement à l'écart avec la date de début originale ?",
    Reschedule: 'Replanifier',
    No: 'Non',
    'Export data of current exercise':
      "Exporter les données de l'exercice courant",
    Item: 'Element',
    'Export audiences data': 'Exporter les données concernant les audiences',
    Objective: 'Objectifs',
    'Export objectives data': 'Exporter les données concernant les objectifs',
    Events: 'Evenements',
    'Export events data': 'Exporter les données concernant les événements',
    'Export incidents data': 'Exporter les données concernant les incidents',
    Inject: 'Injections',
    'Export injects data': 'Exporter les données concernant les injections',
    'Export of the exercise': "Export de l'exercice",
    'Full export for an excercise.': 'Exporter un exercice complet.',
    'Note: you can import a previously exported exercise from the home page.':
      "Note : vous pouvez importer un exercice préalablement exporté depuis la page d'accueil.",
    'Import data to an exercise.': 'Importer un exercice complet.',
    search: 'Parcourir',
    Export: 'Exporter',
    'Please, choose data to export':
      'Veuillez sélectionner les données à exporter :',
    'Please, choose data to import':
      'Veuillez sélectionner les données à importer :',
    'Export of Exercise': "Export de l'exercice",
    'Export all email injects to files (.eml) so you can use it into your mail client.':
      'Exporter tous les injects emails vers des fichiers (.eml) pour les utiliser dans votre client mail.',
    'Do you want to change the sender email address?':
      "Souhaitez-vous changer l'adresse email de l'expéditeur ?",
    'Export of the emails': 'Export des emails',
    'Files gallery': 'Galerie de fichiers',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  paper: {
    padding: 20,
    marginBottom: 40,
  },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
});

const dependencies = {
  exercise: [],
  audience: ['exercise'],
  objective: ['exercise'],
  scenarios: ['exercise'],
  incidents: ['scenarios', 'exercise'],
  injects: ['incidents', 'scenarios', 'exercise'],
};
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openGallery: false,
      openExport: false,
      openImport: false,
      newStartDate: '',
      newData: '',
      exerciseNameExist: false,
      file: { file_id: '0' },
      typesToExport: {
        exercise: '1',
        audience: '1',
        objective: '1',
        scenarios: '1',
        incidents: '1',
        injects: '1',
      },
    };
  }

  componentDidMount() {
    this.props.fetchGroups();
  }

  onUpdate(data) {
    const newData = R.pipe(
      // Need to convert date to ISO format with timezone
      R.assoc('exercise_start_date', dateToISO(data.exercise_start_date)),
      R.assoc('exercise_end_date', dateToISO(data.exercise_end_date)),
    )(data);
    return this.props.updateExercise(this.props.id, newData);
  }

  submitExportEml() {
    return this.props.exportInjectEml(this.props.id);
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
  }

  handleOpenExport() {
    this.setState({ openExport: true });
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  handleCloseExport() {
    this.setState({ openExport: false });
  }

  handleExportCheck(type, event) {
    const { typesToExport } = this.state;
    const isChecked = event.target.checked;
    typesToExport[type] = isChecked ? '1' : '0';
    if (isChecked) {
      // Check all dependencies
      for (let index = 0; index < dependencies[type].length; index += 1) {
        const typeElement = dependencies[type][index];
        typesToExport[typeElement] = '1';
      }
    } else {
      // Uncheck all dependent on this one
      const entries = Object.entries(dependencies);
      for (let index = 0; index < entries.length; index += 1) {
        const [k, v] = entries[index];
        if (v.includes(type)) {
          typesToExport[k] = '0';
        }
      }
    }
    // Type to export are hierarchical, check or uncheck must be propagated
    this.setState({ typesToExport });
  }

  handleOpenGallery() {
    this.setState({ openGallery: true });
  }

  handleCloseGallery() {
    this.setState({ openGallery: false });
  }

  submitDelete() {
    return this.props
      .deleteExercise(this.props.id)
      .then(() => this.props.redirectToHome());
  }

  // eslint-disable-next-line consistent-return
  submitExport() {
    const dataToExport = this.state.typesToExport;
    this.setState({ openExport: false });
    return this.props.exportExercise(this.props.id, dataToExport);
  }

  handleImageSelection(file) {
    const data = { exercise_image: file.file_id };
    this.props.updateExercise(this.props.id, data);
    this.handleCloseGallery();
  }

  render() {
    const exerciseIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.exercise,
    );
    const exerciseIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.exercise,
    );
    const { classes, exercise } = this.props;
    const initPipe = R.pipe(
      R.assoc(
        'exercise_animation_group',
        R.path(['exercise', 'exercise_animation_group'], this.props),
      ),
      R.pick([
        'exercise_name',
        'exercise_description',
        'exercise_subtitle',
        'exercise_start_date',
        'exercise_end_date',
        'exercise_message_header',
        'exercise_message_footer',
        'exercise_mail_expediteur',
        'exercise_animation_group',
        'exercise_latitude',
        'exercise_longitude',
      ]),
    );
    const informationValues = exercise !== undefined ? initPipe(exercise) : undefined;
    const imageId = R.pathOr(null, ['exercise_image', 'file_id'], exercise);
    const { typesToExport } = this.state;
    return (
      <div style={{ width: 800, margin: '0 auto' }}>
        {exerciseIsUpdatable && (
          <Paper elevation={4} className={classes.paper}>
            <Typography variant="h5" style={{ marginBottom: 20 }}>
              Information
            </Typography>
            {informationValues && (
              <ExerciseForm
                onSubmit={this.onUpdate.bind(this)}
                edit={true}
                initialValues={informationValues}
                groups={this.props.groups}
              />
            )}
            <br />
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('exerciseForm')}
            >
              <T>Update</T>
            </Button>
          </Paper>
        )}
        {exerciseIsUpdatable && (
          <Paper elevation={4} className={classes.paper}>
            <Typography variant="h5" style={{ marginBottom: 20 }}>
              <T>Messages template</T>
            </Typography>
            {informationValues && (
              <TemplateForm
                onSubmit={this.onUpdate.bind(this)}
                initialValues={informationValues}
              />
            )}
            <br />
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('templateForm')}
            >
              <T>Update</T>
            </Button>
          </Paper>
        )}
        <Paper elevation={4} className={classes.paper}>
          <Typography variant="h5" style={{ marginBottom: 20 }}>
            Image
          </Typography>
          {imageId && (
            <Image
              image_id={imageId}
              alt="Exercise logo"
              style={{ width: '90%' }}
            />
          )}
          <br />
          <br />
          {exerciseIsUpdatable && (
            <div>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleOpenGallery.bind(this)}
              >
                <T>Change the image</T>
              </Button>
              <Dialog
                open={this.state.openGallery}
                onClose={this.handleCloseGallery.bind(this)}
                TransitionComponent={Transition}
                fullScreen={true}
              >
                <AppBar className={classes.appBar}>
                  <Toolbar>
                    <IconButton
                      edge="start"
                      color="inherit"
                      onClick={this.handleCloseGallery.bind(this)}
                      aria-label="close"
                    >
                      <Close />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                      <T>Files gallery</T>
                    </Typography>
                  </Toolbar>
                </AppBar>
                <DialogContent>
                  <FileGallery
                    fileSelector={this.handleImageSelection.bind(this)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </Paper>
        <Paper elevation={4} className={classes.paper}>
          <Typography variant="h5" style={{ marginBottom: 20 }}>
            <T>Export of the emails</T>
          </Typography>
          <Typography variant="body1" style={{ marginBottom: 20 }}>
            <T>
              Export all email injects to files (.eml) so you can use it into
              your mail client.
            </T>
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.submitExportEml.bind(this)}
          >
            <T>Export</T>
          </Button>
        </Paper>
        <Paper elevation={4} className={classes.paper}>
          <Typography variant="h5" style={{ marginBottom: 20 }}>
            <T>Export of the exercise</T>
          </Typography>
          <Typography variant="body1" style={{ marginBottom: 20 }}>
            <T>
              Note: you can import a previously exported exercise from the home
              page.
            </T>
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.handleOpenExport.bind(this)}
          >
            <T>Export</T>
          </Button>
          <Dialog
            fullWidth={true}
            maxWidth="md"
            TransitionComponent={Transition}
            open={this.state.openExport}
            onClose={this.handleCloseExport.bind(this)}
          >
            <DialogTitle>
              <T>Export of Exercise</T>
            </DialogTitle>
            <DialogContent>
              <T>Please, choose data to export</T>
              <Table selectable={true} style={{ marginTop: '5px' }}>
                <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableCell width="30">
                      <T>Export</T>
                    </TableCell>
                    <TableCell width="130">
                      <T>Item</T>
                    </TableCell>
                    <TableCell>
                      <T>Description</T>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody displayRowCheckbox={false}>
                  <TableRow key="tab-exercise">
                    <TableCell width="30">
                      <Checkbox
                        checked={typesToExport.exercise === '1'}
                        name="chk-export-exercise"
                        onClick={this.handleExportCheck.bind(this, 'exercise')}
                      />
                    </TableCell>
                    <TableCell width="130">
                      <T>Exercise</T>
                    </TableCell>
                    <TableCell>
                      <T>Export data of current exercise</T>
                    </TableCell>
                  </TableRow>
                  <TableRow key="tab-audiences">
                    <TableCell width="30">
                      <Checkbox
                        checked={typesToExport.audience === '1'}
                        name="chk-export-audiences"
                        onClick={this.handleExportCheck.bind(this, 'audience')}
                      />
                    </TableCell>
                    <TableCell width="130">
                      <T>Audiences</T>
                    </TableCell>
                    <TableCell>
                      <T>Export audiences data</T>
                    </TableCell>
                  </TableRow>
                  <TableRow key="tab-objective">
                    <TableCell width="30">
                      <Checkbox
                        checked={typesToExport.objective === '1'}
                        name="chk-export-objective"
                        onClick={this.handleExportCheck.bind(this, 'objective')}
                      />
                    </TableCell>
                    <TableCell width="130">
                      <T>Objective</T>
                    </TableCell>
                    <TableCell>
                      <T>Export objectives data</T>
                    </TableCell>
                  </TableRow>
                  <TableRow key="tab-scenarios">
                    <TableCell width="30">
                      <Checkbox
                        checked={typesToExport.scenarios === '1'}
                        name="chk-export-scenarios"
                        onClick={this.handleExportCheck.bind(this, 'scenarios')}
                      />
                    </TableCell>
                    <TableCell width="130">
                      <T>Events</T>
                    </TableCell>
                    <TableCell>
                      <T>Export events data</T>
                    </TableCell>
                  </TableRow>
                  <TableRow key="tab-incidents">
                    <TableCell width="30">
                      <Checkbox
                        checked={typesToExport.incidents === '1'}
                        name="chk-export-incidents"
                        onClick={this.handleExportCheck.bind(this, 'incidents')}
                      />
                    </TableCell>
                    <TableCell width="130">
                      <T>Incidents</T>
                    </TableCell>
                    <TableCell>
                      <T>Export incidents data</T>
                    </TableCell>
                  </TableRow>
                  <TableRow key="tab-injects">
                    <TableCell width="30">
                      <Checkbox
                        checked={typesToExport.injects === '1'}
                        name="chk-export-injects"
                        onClick={this.handleExportCheck.bind(this, 'injects')}
                      />
                    </TableCell>
                    <TableCell width="130">
                      <T>Injects</T>
                    </TableCell>
                    <TableCell>
                      <T>Export injects data</T>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={this.handleCloseExport.bind(this)}
              >
                <T>Cancel</T>
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.submitExport.bind(this)}
              >
                <T>Export</T>
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
        {exerciseIsDeletable && (
          <Paper elevation={4} className={classes.paper}>
            <Typography variant="h5" style={{ marginBottom: 20 }}>
              <T>Delete</T>
            </Typography>
            <Typography variant="body1" style={{ marginBottom: 20 }}>
              <T>
                Deleting an exercise will result in deleting all its content,
                including objectives, events, incidents, injects and audience.
                We do not recommend you do this.
              </T>
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleOpenDelete.bind(this)}
            >
              <T>Delete</T>
            </Button>
            <Dialog
              open={this.state.openDelete}
              TransitionComponent={Transition}
              onClose={this.handleCloseDelete.bind(this)}
            >
              <DialogContent>
                <DialogContentText>
                  <T>Do you want to delete this exercise?</T>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseDelete.bind(this)}
                >
                  <T>Cancel</T>
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={this.submitDelete.bind(this)}
                >
                  <T>Delete</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        )}
      </div>
    );
  }
}

Index.propTypes = {
  id: PropTypes.string,
  exercise: PropTypes.object,
  exercise_statuses: PropTypes.object,
  initialEmailExpediteur: PropTypes.string,
  params: PropTypes.object,
  updateExercise: PropTypes.func,
  redirectToHome: PropTypes.func,
  deleteExercise: PropTypes.func,
  exportInjectEml: PropTypes.func,
  exportExercise: PropTypes.func,
  shiftAllInjects: PropTypes.func,
  fetchGroups: PropTypes.func,
  groups: PropTypes.array,
  addFile: PropTypes.func,
  userCanUpdate: PropTypes.bool,
  getImportFileSheetsName: PropTypes.func,
};

const checkUserCanUpdate = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const userId = R.path(['logged', 'user'], state.app);
  let userCanUpdate = R.path(
    [userId, 'user_admin'],
    state.referential.entities.users,
  );
  if (!userCanUpdate) {
    const groupValues = R.values(state.referential.entities.groups);
    groupValues.forEach((group) => {
      group.group_grants.forEach((grant) => {
        if (
          grant
          && grant.grant_exercise
          && grant.grant_exercise.exercise_id === exerciseId
          && grant.grant_name === 'PLANNER'
        ) {
          group.group_users.forEach((user) => {
            if (user === userId) {
              userCanUpdate = true;
            }
          });
        }
      });
    });
  }
  return userCanUpdate;
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const exercise = R.prop(exerciseId, state.referential.entities.exercises);
  return {
    id: exerciseId,
    exercise,
    groups: R.values(state.referential.entities.groups),
    userCanUpdate: checkUserCanUpdate(state, ownProps),
    initialEmailExpediteur: R.prop('exercise_mail_expediteur', exercise),
  };
};

export default R.compose(
  connect(select, {
    updateExercise,
    redirectToHome,
    deleteExercise,
    exportInjectEml,
    exportExercise,
    fetchGroups,
    shiftAllInjects,
    addFile,
    getImportFileSheetsName,
  }),
  withStyles(styles),
)(Index);
