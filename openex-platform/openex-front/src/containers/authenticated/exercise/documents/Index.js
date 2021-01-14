import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { injectIntl } from 'react-intl';
import { T } from '../../../../components/I18n';
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
import {
  TagAddToFilter,
  TagExerciseListe,
  TagListe,
  TagSmallExerciseListe,
  TagSmallListe,
} from './component/Tag';

const styles = () => ({
  container: {
    position: 'relative',
  },
  search: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tags: {
    float: 'left',
    marginLeft: 20,
  },
});

i18nRegister({
  fr: {
    Tags: 'Tags',
    'Tag:': 'Tag :',
    'List of tags': 'Liste des tags',
    'Documents gallery': 'Galerie de documents',
    'Search by:': 'Rechercher par :',
    'No added tags, select a tag from the list on the right to add it as a filter.':
      "Aucun tag ajouté, sélectionner un tag sur la liste de droite pour l'ajouter comme filtre.",
    'No Document available': 'Aucun document de disponible',
    'Add new document': 'Ajouter un document',
    'No Tag Available': 'Aucun TAG de disponible',
    'Edit document': "Modification d'un document",
    'List of Documents': 'Liste des documents',
    'Editing Tags in a document': "Modification des Tags d'un document",
    'List of documents including the following tags : ':
      'Liste des documents incluant les Tags suivants : ',
    'Delete Tag': "Suppression d'un tag",
    'Are you sure you want to delete this tag?':
      'Êtes-vous sûr de vouloir supprimer ce Tag ?',
  },
  en: {
    Search: 'Search',
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
    this.props.searchDocument(null);
  }

  handleSearchDocument(event, value) {
    this.setState({
      searchTerm: value,
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

  handleEditDocumentEditTag() {
    this.refs.documentForm.submit();
    this.handleCloseEditDocument();
    this.handleEditDocumentTag(this.state.selectedDocument.document_id);
  }

  handleEditDocumentTag(documentId) {
    this.setState({
      selectedDocument: documentId,
    });
    // recherche des tags du document
    this.props.getDocumentTags(documentId).then((tags) => {
      this.setState({
        documentsTags: tags.result,
      });
      // recherche des tags 'exercices' du document
      this.props.getDocumentTagsExercise(documentId).then((tagsExercise) => {
        this.setState({
          documentsTagsExercise: tagsExercise.result,
          openEditDocumentTag: true,
        });
      });
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
    this.props.deleteDocument(document.document_id).then(() => {
      window.location.reload();
    });
  }

  submitEditDocument() {
    this.refs.documentForm.submit();
  }

  submitEditDocumentTag() {
    this.handleCloseEditDocumentTag();
    this.props
      .editDocumentTags(this.state.selectedDocument, {
        tags: this.state.documentsTags,
      })
      .then(() => {
        this.props
          .editDocumentTagsExercise(this.state.selectedDocument, {
            tags: this.state.documentsTagsExercise,
          })
          .then(() => {
            window.location.reload();
          });
      });
  }

  onSubmitDocument(data) {
    this.props.saveDocument(data.document_id, data).then(() => {
      window.location.reload();
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
      // pour chaque tag de la recherche
      listeTagAddToFilter.forEach((tagCritere) => {
        let exist = false;
        // pour chaque tag document
        document.document_liste_tags.forEach((tagDocument) => {
          if (tagDocument.tag_id === tagCritere.tag_id) {
            exist = true;
          }
        });
        listeTagCritere.push({ tag_id: tagCritere.tag_id, exist });
      });

      // pour chaque tag exercice
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
    const actionsEditDocument = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEditDocument.bind(this)}
      />,
      <Button
        key="tags"
        label="List Of Tags"
        primary={true}
        onClick={this.handleEditDocumentEditTag.bind(this)}
      />,
      <Button
        key="submit"
        label="Submit"
        primary={true}
        onClick={this.submitEditDocument.bind(this)}
      />,
    ];

    const actionsOpenConfirmDeleteTag = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseConfirmDeleteTag.bind(this)}
      />,
      <Button
        key="submit"
        label="Submit"
        primary={true}
        onClick={this.handleSubmitConfirmDeleteTag.bind(this)}
      />,
    ];

    const actionsEditDocumentTag = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEditDocumentTag.bind(this)}
      />,
      <Button
        key="submit"
        label="Submit"
        primary={true}
        onClick={this.submitEditDocumentTag.bind(this)}
      />,
    ];

    return (
      <div className={classes.container}>
        <Typography variant="h5" style={{ marginBottom: 20, float: 'left' }}>
          <T>Documents gallery</T>
        </Typography>
        <div className={classes.tags}>
          {R.values(this.state.listeTagExerciseAddToFilter).map((exercise) => (
            <TagAddToFilter
              key={exercise.exercise_id}
              value={exercise.exercise_name}
              onRequestDelete={this.removeTagExerciseToFilter.bind(
                this,
                exercise,
              )}
            />
          ))}
          {R.values(this.state.listeTagAddToFilter).map((tag) => (
            <TagAddToFilter
              key={tag.tag_id}
              value={tag.tag_name}
              onRequestDelete={this.removeTagToFilter.bind(this, tag)}
            />
          ))}
          <div className="clearfix" />
          {this.state.listeTagAddToFilter.length !== 0
            || (this.state.listeTagExerciseAddToFilter.length !== 0 && (
              <div>
                <T>List of documents including the following tags : </T>
                {R.values(this.state.listeTagExerciseAddToFilter).map(
                  (exercise) => `${exercise.exercise_name}, `,
                )}
                {R.values(this.state.listeTagAddToFilter).map(
                  (tag) => `${tag.tag_name}, `,
                )}
              </div>
            ))}
        </div>
        <div className={classes.search}>
          <TextField
            name="keyword"
            placeholder={this.props.intl.formatMessage({ id: 'Search' })}
            onChange={this.handleSearchDocument.bind(this)}
          />
        </div>
        <Grid container spacing={3}>
          <Grid item xs={9}>
            <Table selectable={true} style={{ marginTop: '5px' }}>
              <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow>
                  <TableCell>
                    <T>Name</T>
                  </TableCell>
                  <TableCell>
                    <T>Description</T>
                  </TableCell>
                  <TableCell>
                    <T>Type</T>
                  </TableCell>
                  <TableCell>
                    <T>Tags</T>
                  </TableCell>
                  <TableCell width="20">&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody displayRowCheckbox={false}>
                {this.props.documents.map((document) => {
                  const listeTagAddToFilter = [
                    ...this.state.listeTagAddToFilter,
                  ];
                  const listeTagExerciseAddToFilter = [
                    ...this.state.listeTagExerciseAddToFilter,
                  ];
                  const toDisplay = this.checkIfDocumentIsDisplay(
                    document,
                    listeTagAddToFilter,
                    listeTagExerciseAddToFilter,
                    this.state.searchTerm,
                  );
                  return toDisplay === true ? (
                    <TableRow key={document.document_id}>
                      <TableCell>{document.document_name}</TableCell>
                      <TableCell
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: 'normal',
                        }}
                      >
                        {document.document_description}
                      </TableCell>
                      <TableCell>{document.document_type}</TableCell>
                      <TableCell>
                        {document.document_liste_tags.map((tag) => (
                          <TagSmallListe
                            key={tag.tag_id}
                            value={tag.tag_name}
                          />
                        ))}
                        {document.document_liste_tags_exercise.map(
                          (exercise) => (
                            <TagSmallExerciseListe
                              key={exercise.exercise_id}
                              value={exercise.exercise_name}
                            />
                          ),
                        )}
                      </TableCell>
                      <TableCell width="20">
                        <div>
                          {this.props.userCanUpdate ? (
                            <DocumentActionPopover
                              document_id={document.document_id}
                              document={document}
                              handleEditDocument={this.handleEditDocument.bind(
                                this,
                              )}
                              handleViewDocument={this.handleViewDocument.bind(
                                this,
                              )}
                              handleEditDocumentTag={this.handleEditDocumentTag.bind(
                                this,
                              )}
                              handleDeleteDocument={this.handleDeleteDocument.bind(
                                this,
                              )}
                            />
                          ) : (
                            ''
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    ''
                  );
                })}
              </TableBody>
            </Table>
            {this.props.userCanUpdate && (
              <Button
                label="Add new document"
                primary={true}
                onClick={this.openFileDialog.bind(this)}
              />
            )}
          </Grid>
          <Grid item xs={3}>
            {this.props.tags.length === 0 && this.props.exercises === 0 && (
              <div style={styles.empty}>
                <T>No Tag Available</T>
              </div>
            )}
            {this.props.tags.map((tag) => (
              <TagListe
                key={tag.tag_id}
                value={tag.tag_name}
                onClick={this.addAvailableTagToFilter.bind(this, tag)}
                onRequestDelete={this.handleOpenConfirmDeleteTag.bind(
                  this,
                  tag,
                )}
              />
            ))}
            {this.props.exercises.map((exercise) => (
              <TagExerciseListe
                key={exercise.exercise_id}
                value={exercise.exercise_name}
                onClick={this.addAvailableTagExerciseToFilter.bind(
                  this,
                  exercise,
                )}
              />
            ))}
            {this.props.userCanUpdate ? <CreateTag /> : ''}
          </Grid>
        </Grid>
        <input
          type="file"
          ref="fileUpload"
          style={{ display: 'none' }}
          onChange={this.handleFileChange.bind(this)}
        />
        {this.props.userCanUpdate ? (
          <Dialog
            title="Edit document"
            modal={false}
            open={this.state.openEditDocument}
            onRequestClose={this.handleCloseEditDocument.bind(this)}
            actions={actionsEditDocument}
          >
            <DocumentForm
              ref="documentForm"
              initialValues={this.state.selectedDocument}
              onSubmit={this.onSubmitDocument.bind(this)}
              onSubmitSuccess={this.handleCloseEditDocument.bind(this)}
            />
          </Dialog>
        ) : (
          ''
        )}
        {this.props.userCanUpdate ? (
          <Dialog
            title="Delete Tag"
            modal={false}
            open={this.state.openConfirmDeleteTag}
            onRequestClose={this.handleCloseConfirmDeleteTag.bind(this)}
            actions={actionsOpenConfirmDeleteTag}
          >
            <T>Are you sure you want to delete this tag?</T>
          </Dialog>
        ) : (
          ''
        )}

        {this.props.userCanUpdate ? (
          <Dialog
            title="Editing Tags in a document"
            modal={false}
            open={this.state.openEditDocumentTag}
            onRequestClose={this.handleCloseEditDocumentTag.bind(this)}
            actions={actionsEditDocumentTag}
          >
            <DocumentTags
              document_id={this.state.selectedDocument}
              handleAddDocumentTag={this.handleAddDocumentTag.bind(this)}
              handleRemoveDocumentTag={this.handleRemoveDocumentTag.bind(this)}
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
          </Dialog>
        ) : (
          ''
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
  injectIntl,
)(Index);
