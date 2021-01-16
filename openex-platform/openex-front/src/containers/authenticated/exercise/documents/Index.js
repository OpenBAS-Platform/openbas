import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Fab from '@material-ui/core/Fab';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import {
  Add,
  LabelOutlined,
  DeleteOutlined,
  InsertDriveFileOutlined,
} from '@material-ui/icons';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import { T } from '../../../../components/I18n';
import { SearchField } from '../../../../components/SearchField';
import { i18nRegister } from '../../../../utils/Messages';
import { timeDiff } from '../../../../utils/Time';
import { fetchGroups } from '../../../../actions/Group';
import { deleteTag, fetchTags } from '../../../../actions/Tag';
import {
  addDocument,
  deleteDocument,
  downloadDocument,
  editDocumentTags,
  editDocumentTagsExercise,
  getDocument,
  getDocumentTags,
  getDocumentTagsExercise,
  saveDocument,
  searchDocument,
} from '../../../../actions/Document';
import { fetchExercises } from '../../../../actions/Exercise';
import CreateTag from './tag/CreateTag';
import DocumentForm from './document/DocumentForm';
import DocumentActionPopover from './tag/DocumentActionPopover';
import DocumentTags from './document/DocumentTags';
import { submitForm } from '../../../../utils/Action';

i18nRegister({
  fr: {
    Tags: 'Tags',
    'Tag:': 'Tag :',
    'List of tags': 'Liste des tags',
    'Documents gallery': 'Galerie de documents',
    'Search by:': 'Rechercher par :',
    'No added tags, select a tag from the list on the right to add it as a filter.':
      "Aucun tag ajouté, sélectionner un tag sur la liste de droite pour l'ajouter comme filtre.",
    'No document available.': 'Aucun document disponible',
    'Add new document': 'Ajouter un document',
    'Edit document': "Modification d'un document",
    'List of documents': 'Liste des documents',
    'Update tags of a document': "Modification des tags d'un document",
    'List of documents including the following tags : ':
      'Liste des documents incluant les Tags suivants : ',
    'Delete Tag': "Suppression d'un tag",
    'Are you sure you want to delete this tag?':
      'Êtes-vous sûr de vouloir supprimer ce tag ?',
    'No description': 'Aucune description',
  },
  en: {
    Search: 'Search',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  container: {
    paddingRight: '300px',
  },
  header: {
    height: 50,
  },
  search: {
    float: 'right',
  },
  tags: {
    float: 'left',
    margin: '-5px 0 0 20px',
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 330,
  },
  drawerPaper: {
    width: 300,
  },
  drawerContainer: {
    padding: 15,
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
});

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      openEditDocument: false,
      openEditDocumentTag: false,
      openConfirmDeleteTag: false,
      listeTagAddToFilter: [],
      listeTagExerciseAddToFilter: [],
      documentsTags: [],
      documentsTagsExercise: [],
      selectedDocument: {},
      selectedTag: {},
    };
  }

  componentDidMount() {
    this.props.fetchGroups();
    this.props.fetchTags();
    this.props.fetchExercises();
    this.props.searchDocument('');
  }

  handleSearchDocument(event) {
    this.setState({
      searchTerm: event.target.value,
    });
  }

  handleOpenConfirmDeleteTag(selectedTag) {
    this.setState({
      selectedTag,
      openConfirmDeleteTag: true,
    });
  }

  handleSubmitConfirmDeleteTag() {
    const { selectedTag } = this.state;
    this.props.deleteTag(selectedTag.tag_id).then(() => {
      this.removeTagToFilter(selectedTag);
      this.setState({
        openConfirmDeleteTag: false,
      });
    });
  }

  handleCloseConfirmDeleteTag() {
    this.setState({
      openConfirmDeleteTag: false,
    });
  }

  deleteTag(tag) {
    this.handleOpenConfirmDeleteTag(tag);
  }

  addAvailableTagToFilter(tag) {
    const listeTagAddToFilter = [...this.state.listeTagAddToFilter];
    let allreadyExist = false;
    listeTagAddToFilter.forEach((element) => {
      if (element.tag_id === tag.tag_id) {
        allreadyExist = true;
      }
    });
    if (allreadyExist === false) {
      listeTagAddToFilter.push({ tag_id: tag.tag_id, tag_name: tag.tag_name });
      this.setState({
        listeTagAddToFilter,
      });
    } else {
      this.removeTagToFilter(tag);
    }
  }

  addAvailableTagExerciseToFilter(exercise) {
    const listeTagExerciseAddToFilter = [
      ...this.state.listeTagExerciseAddToFilter,
    ];
    let allreadyExist = false;
    listeTagExerciseAddToFilter.forEach((element) => {
      if (element.exercise_id === exercise.exercise_id) {
        allreadyExist = true;
      }
    });
    if (allreadyExist === false) {
      listeTagExerciseAddToFilter.push({
        exercise_id: exercise.exercise_id,
        exercise_name: exercise.exercise_name,
      });
      this.setState({
        listeTagExerciseAddToFilter,
      });
    } else {
      this.removeTagExerciseToFilter(exercise);
    }
  }

  removeTagToFilter(tag) {
    const listeTagAddToFilter = [...this.state.listeTagAddToFilter];
    const newListeTagAddToFilter = [];
    listeTagAddToFilter.forEach((element) => {
      if (element.tag_id !== tag.tag_id) {
        newListeTagAddToFilter.push(element);
      }
    });
    this.setState({
      listeTagAddToFilter: newListeTagAddToFilter,
    });
  }

  removeTagExerciseToFilter(exercise) {
    const listeTagExerciseAddToFilter = [
      ...this.state.listeTagExerciseAddToFilter,
    ];
    const newListeTagExerciseAddToFilter = [];
    listeTagExerciseAddToFilter.forEach((element) => {
      if (element.exercise_id !== exercise.exercise_id) {
        newListeTagExerciseAddToFilter.push(element);
      }
    });
    this.setState({
      listeTagExerciseAddToFilter: newListeTagExerciseAddToFilter,
    });
  }

  openFileDialog() {
    this.refs.fileUpload.click();
  }

  handleFileChange() {
    const data = new FormData();
    data.append('file', this.refs.fileUpload.files[0]);
    this.props.addDocument(data).then((documentId) => {
      this.props.getDocument(documentId.result).then((document) => {
        this.handleEditDocument(
          R.prop(document.result, document.entities.document),
        );
      });
    });
  }

  handleEditDocument(document) {
    this.setState({
      selectedDocument: document,
      openEditDocument: true,
    });
  }

  handleViewDocument(document) {
    this.setState({
      selectedDocument: document,
    });
    return this.props.downloadDocument(
      document.document_id,
      document.document_name,
    );
  }

  handleEditDocumentTag(documentId) {
    this.setState({
      selectedDocument: documentId,
    });
    this.props.getDocumentTags(documentId).then((tags) => {
      this.setState(
        {
          documentsTags: tags.result,
        },
        () => {
          this.props
            .getDocumentTagsExercise(documentId)
            .then((tagsExercise) => {
              this.setState({
                documentsTagsExercise: tagsExercise.result,
                openEditDocumentTag: true,
              });
            });
        },
      );
    });
  }

  handleCloseEditDocument() {
    this.setState({
      openEditDocument: false,
    });
  }

  handleCloseEditDocumentTag() {
    this.setState({
      openEditDocumentTag: false,
    });
  }

  handleDeleteDocument(document) {
    this.props
      .deleteDocument(document.document_id)
      .then(() => this.handleCloseConfirmDeleteTag());
  }

  submitEditDocumentTag() {
    this.handleCloseEditDocumentTag();
    this.props
      .editDocumentTags(this.state.selectedDocument, {
        tags: this.state.documentsTags,
      })
      .then(() => {
        this.props.editDocumentTagsExercise(this.state.selectedDocument, {
          tags: this.state.documentsTagsExercise,
        });
      })
      .then(() => this.props.searchDocument(this.state.searchTerm));
  }

  onSubmitDocument(data) {
    this.props.saveDocument(data.document_id, data).then(() => {
      this.handleCloseEditDocument();
    });
  }

  handleAddDocumentTag(tag) {
    const documentsTags = [...this.state.documentsTags];
    documentsTags.push(tag.tag_id);
    this.setState({
      documentsTags,
    });
  }

  handleAddDocumentTagExercise(exercise) {
    const documentsTagsExercise = [...this.state.documentsTagsExercise];
    documentsTagsExercise.push(exercise.exercise_id);
    this.setState({
      documentsTagsExercise,
    });
  }

  handleRemoveDocumentTag(tag) {
    const documentsTags = [...this.state.documentsTags];
    const index = documentsTags.indexOf(tag.tag_id);
    documentsTags.splice(index, 1);
    this.setState({
      documentsTags,
    });
  }

  handleRemoveDocumentTagExercise(exercise) {
    const documentsTagsExercise = [...this.state.documentsTagsExercise];
    const index = documentsTagsExercise.indexOf(exercise.exercise_id);
    documentsTagsExercise.splice(index, 1);
    this.setState({
      documentsTagsExercise,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  checkIfDocumentIsDisplay(
    document,
    listeTagAddToFilter,
    listeTagExerciseAddToFilter,
    keyWords,
  ) {
    let toDisplay = true;
    const listeTagCritere = [];
    const listeTagExerciseCritere = [];

    if (keyWords !== '') {
      if (
        document.document_name.toLowerCase().indexOf(keyWords.toLowerCase())
        === -1
      ) {
        toDisplay = false;
      }
    }
    if (toDisplay === true) {
      listeTagAddToFilter.forEach((tagCritere) => {
        let exist = false;
        document.document_liste_tags.forEach((tagDocument) => {
          if (tagDocument.tag_id === tagCritere.tag_id) {
            exist = true;
          }
        });
        listeTagCritere.push({ tag_id: tagCritere.tag_id, exist });
      });
      listeTagExerciseAddToFilter.forEach((tagExerciseCritere) => {
        let exist = false;
        document.document_liste_tags_exercise.forEach((tagDocument) => {
          if (tagDocument.exercise_id === tagExerciseCritere.exercise_id) {
            exist = true;
          }
        });
        listeTagExerciseCritere.push({
          exercise_id: tagExerciseCritere.exercise_id,
          exist,
        });
      });
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < listeTagCritere.length; i++) {
        if (listeTagCritere[i].exist === false) {
          toDisplay = false;
        }
      }
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < listeTagExerciseCritere.length; i++) {
        if (listeTagExerciseCritere[i].exist === false) {
          toDisplay = false;
        }
      }
    }
    return toDisplay;
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <Typography variant="h5" style={{ float: 'left' }}>
            <T>Documents gallery</T>
          </Typography>
          <div className={classes.tags}>
            {R.values(this.state.listeTagExerciseAddToFilter).map(
              (exercise) => (
                <Chip
                  key={exercise.exercise_id}
                  className={classes.tag}
                  variant="outlined"
                  color="primary"
                  label={exercise.exercise_name}
                  onDelete={this.removeTagExerciseToFilter.bind(this, exercise)}
                />
              ),
            )}
            {R.values(this.state.listeTagAddToFilter).map((tag) => (
              <Chip
                key={tag.tag_id}
                className={classes.tag}
                variant="outlined"
                color="primary"
                label={tag.tag_name}
                onDelete={this.removeTagToFilter.bind(this, tag)}
              />
            ))}
          </div>
          <div className={classes.search}>
            <SearchField onChange={this.handleSearchDocument.bind(this)} />
          </div>
          <div className="clearfix" />
        </div>
        {this.props.documents.length === 0 && (
          <div className={classes.empty}>
            <T>No document available.</T>
          </div>
        )}
        <List>
          {this.props.documents.map((document) => {
            const listeTagAddToFilter = [...this.state.listeTagAddToFilter];
            const listeTagExerciseAddToFilter = [
              ...this.state.listeTagExerciseAddToFilter,
            ];
            const toDisplay = this.checkIfDocumentIsDisplay(
              document,
              listeTagAddToFilter,
              listeTagExerciseAddToFilter,
              this.state.searchTerm,
            );
            return (
              toDisplay === true && (
                <ListItem divider={true}>
                  <ListItemIcon>
                    <InsertDriveFileOutlined color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={document.document_name}
                    secondary={
                      document.document_description ? (
                        document.document_description
                      ) : (
                        <T>No description</T>
                      )
                    }
                  />
                  <div style={{ marginRight: 15 }}>
                    {document.document_liste_tags.map((tag) => (
                      <Chip
                        variant="outlined"
                        color="primary"
                        key={tag.tag_id}
                        label={tag.tag_name}
                        style={{ marginRight: 15 }}
                      />
                    ))}
                    {document.document_liste_tags_exercise.map((exercise) => (
                      <Chip
                        variant="outlined"
                        color="primary"
                        key={exercise.exercise_id}
                        label={exercise.exercise_name}
                        style={{ marginRight: 15 }}
                      />
                    ))}
                  </div>
                  <ListItemSecondaryAction>
                    <DocumentActionPopover
                      document_id={document.document_id}
                      document={document}
                      handleEditDocument={this.handleEditDocument.bind(this)}
                      handleViewDocument={this.handleViewDocument.bind(this)}
                      handleEditDocumentTag={this.handleEditDocumentTag.bind(
                        this,
                      )}
                      handleDeleteDocument={this.handleDeleteDocument.bind(
                        this,
                      )}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              )
            );
          })}
        </List>
        {this.props.userCanUpdate && (
          <Fab
            onClick={this.openFileDialog.bind(this)}
            color="secondary"
            aria-label="Add"
            className={classes.createButton}
          >
            <Add />
          </Fab>
        )}
        <Drawer
          variant="permanent"
          classes={{ paper: classes.drawerPaper }}
          anchor="right"
        >
          <Toolbar />
          {this.props.userCanUpdate ? (
            <CreateTag />
          ) : (
            <Typography
              variant="h5"
              style={{ margin: '15px 0 0 15px', float: 'left' }}
            >
              <T>Tags</T>
            </Typography>
          )}
          <List>
            {this.props.tags.map((tag) => (
              <ListItem
                key={tag.tag_id}
                button={true}
                divider={true}
                onClick={this.addAvailableTagToFilter.bind(this, tag)}
              >
                <ListItemIcon>
                  <LabelOutlined />
                </ListItemIcon>
                <ListItemText primary={tag.tag_name} />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={this.handleOpenConfirmDeleteTag.bind(this, tag)}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {this.props.exercises.map((exercise) => (
              <ListItem
                key={exercise.exercise_id}
                button={true}
                divider={true}
                onClick={this.addAvailableTagExerciseToFilter.bind(
                  this,
                  exercise,
                )}
              >
                <ListItemIcon>
                  <LabelOutlined />
                </ListItemIcon>
                <ListItemText primary={exercise.exercise_name} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <input
          type="file"
          ref="fileUpload"
          style={{ display: 'none' }}
          onChange={this.handleFileChange.bind(this)}
        />
        {this.props.userCanUpdate && (
          <Dialog
            open={this.state.openEditDocument}
            TransitionComponent={Transition}
            onClose={this.handleCloseEditDocument.bind(this)}
          >
            <DialogTitle>
              <T>Edit document</T>
            </DialogTitle>
            <DialogContent>
              <DocumentForm
                initialValues={this.state.selectedDocument}
                onSubmit={this.onSubmitDocument.bind(this)}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={this.handleCloseEditDocument.bind(this)}
              >
                <T>Cancel</T>
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => submitForm('documentForm')}
              >
                <T>Update</T>
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {this.props.userCanUpdate && (
          <Dialog
            open={this.state.openConfirmDeleteTag}
            TransitionComponent={Transition}
            onClose={this.handleCloseConfirmDeleteTag.bind(this)}
          >
            <DialogContent>
              <DialogContentText>
                <T>Are you sure you want to delete this tag?</T>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={this.handleCloseConfirmDeleteTag.bind(this)}
              >
                <T>Cancel</T>
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.handleSubmitConfirmDeleteTag.bind(this)}
              >
                <T>Delete</T>
              </Button>
            </DialogActions>
          </Dialog>
        )}
        {this.props.userCanUpdate && (
          <Dialog
            open={this.state.openEditDocumentTag}
            TransitionComponent={Transition}
            maxWidth="md"
            fullWidth={true}
            onClose={this.handleCloseEditDocumentTag.bind(this)}
          >
            <DialogTitle>
              <T>Update tags of a document</T>
            </DialogTitle>
            <DialogContent>
              <DocumentTags
                document_id={this.state.selectedDocument}
                handleAddDocumentTag={this.handleAddDocumentTag.bind(this)}
                handleRemoveDocumentTag={this.handleRemoveDocumentTag.bind(
                  this,
                )}
                document_tags={this.state.documentsTags}
                handleAddDocumentTagExercise={this.handleAddDocumentTagExercise.bind(
                  this,
                )}
                handleRemoveDocumentTagExercise={this.handleRemoveDocumentTagExercise.bind(
                  this,
                )}
                document_tags_exercise={this.state.documentsTagsExercise}
                availables_tags={this.props.tags}
                availables_exercises_tags={this.props.exercises}
              />
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={this.handleCloseEditDocumentTag.bind(this)}
              >
                <T>Cancel</T>
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.submitEditDocumentTag.bind(this)}
              >
                <T>Update</T>
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }
}

const sortTags = (tags) => {
  const tagsSorting = R.pipe(R.sort((a, b) => a.tag_name > b.tag_name));
  return tagsSorting(tags);
};

const sortExercises = (exercises) => {
  const exercisesSorting = R.pipe(
    R.sort((a, b) => timeDiff(a.exercise_start_date, b.exercise_start_date)),
  );
  return exercisesSorting(exercises);
};

const sortDocuments = (documents) => {
  const documentsSorting = R.pipe(
    R.sort((a, b) => a.document_name > b.document_name),
  );
  return documentsSorting(documents);
};

Index.propTypes = {
  tags: PropTypes.array,
  exercises: PropTypes.array,
  documents: PropTypes.array,
  exerciseId: PropTypes.string,
  fetchGroups: PropTypes.func,
  fetchTags: PropTypes.func,
  addDocument: PropTypes.func,
  saveDocument: PropTypes.func,
  searchDocument: PropTypes.func,
  getDocument: PropTypes.func,
  getDocumentTags: PropTypes.func,
  getDocumentTagsExercise: PropTypes.func,
  editDocumentTags: PropTypes.func,
  editDocumentTagsExercise: PropTypes.func,
  fetchExercises: PropTypes.func,
  deleteDocument: PropTypes.func,
  deleteTag: PropTypes.func,
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
            if (user && user.user_id === userId) {
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
  return {
    exerciseId,
    userCanUpdate: checkUserCanUpdate(state, ownProps),
    exercises: sortExercises(R.values(state.referential.entities.exercises)),
    documents: sortDocuments(R.values(state.referential.entities.document)),
    tags: sortTags(R.values(state.referential.entities.tag)),
  };
};

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchTags,
    fetchExercises,
    addDocument,
    searchDocument,
    saveDocument,
    getDocument,
    getDocumentTags,
    getDocumentTagsExercise,
    deleteTag,
    editDocumentTags,
    downloadDocument,
    editDocumentTagsExercise,
    deleteDocument,
  }),
  withStyles(styles),
)(Index);
