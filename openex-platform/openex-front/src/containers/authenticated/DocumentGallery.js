import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import Toolbar from '@material-ui/core/Toolbar';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import {
  Add,
  InsertDriveFileOutlined,
  LabelOutlined,
} from '@material-ui/icons';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import { fetchExercises } from '../../actions/Exercise';
import {
  addDocument,
  searchDocument,
  getDocument,
  getDocumentTags,
  getDocumentTagsExercise,
} from '../../actions/Document';
import { fetchTags } from '../../actions/Tag';
import { SearchField } from '../../components/SearchField';
import { timeDiff } from '../../utils/Time';
import { i18nRegister } from '../../utils/Messages';
import { T } from '../../components/I18n';

const styles = (theme) => ({
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
  paper: {
    padding: 20,
    marginBottom: 40,
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    padding: '20px 320px 0 20px',
  },
  logo: {
    width: '40px',
    cursor: 'pointer',
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  toolbar: theme.mixins.toolbar,
  documents: {
    color: '#ffffff',
    position: 'absolute',
    top: 8,
    right: 70,
  },
});

i18nRegister({
  fr: {
    'Search by :': 'Rechercher par :',
    'No added tags, select a tag from the list on the right to add it as a filter.':
      "Aucun tag ajouté, sélectionner un tag sur la liste de droite pour l'ajouter comme filtre.",
    'List of Documents': 'Liste des documents',
    'No Document available': 'Aucun document de disponible',
    'List of documents including the following tags : ':
      'Liste des documents incluant les Tags suivants : ',
  },
});

class DocumentGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      listeTagAddToFilter: [],
      listeTagExerciseAddToFilter: [],
      documentsTags: [],
      documentsTagsExercise: [],
    };
  }

  componentDidMount() {
    this.props.fetchTags();
    this.props.fetchExercises();
    this.props.searchDocument(null);
  }

  openFileDialog() {
    this.refs.fileUpload.click();
  }

  handleFileChange() {
    const data = new FormData();
    data.append('file', this.refs.fileUpload.files[0]);
    this.props.addDocument(data).then((document) => {
      this.props.getDocument(document.result).then((finalDocument) => {
        this.handleEditDocument(
          R.prop(finalDocument.result, finalDocument.entities.document),
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

  handleSearchDocument(event) {
    this.setState({ searchTerm: event.target.value });
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
      this.setState({ listeTagAddToFilter });
    } else {
      this.removeTagToFilter(tag);
    }
  }

  handleFileSelector(document) {
    this.props.fileSelector(document);
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
    this.setState({ listeTagAddToFilter: newListeTagAddToFilter });
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
    return (
      <div>
        <Toolbar />
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
                    onDelete={this.removeTagExerciseToFilter.bind(
                      this,
                      exercise,
                    )}
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
                  <ListItem
                    divider={true}
                    key={document.document_id}
                    button={true}
                    onClick={this.handleFileSelector.bind(this, document)}
                  >
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
                  </ListItem>
                )
              );
            })}
          </List>
          <Fab
            onClick={this.openFileDialog.bind(this)}
            color="secondary"
            aria-label="Add"
            className={classes.createButton}
          >
            <Add />
          </Fab>
          <Drawer
            variant="permanent"
            classes={{ paper: classes.drawerPaper }}
            anchor="right"
          >
            <Toolbar />
            <Typography
              variant="h5"
              style={{ margin: '15px 0 0 15px', float: 'left' }}
            >
              <T>Tags</T>
            </Typography>
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
        </div>
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

DocumentGallery.propTypes = {
  tags: PropTypes.array,
  exercises: PropTypes.array,
  documents: PropTypes.array,
  fetchTags: PropTypes.func,
  searchDocument: PropTypes.func,
  getDocument: PropTypes.func,
  getDocumentTags: PropTypes.func,
  getDocumentTagsExercise: PropTypes.func,
  fetchExercises: PropTypes.func,
  fileSelector: PropTypes.func,
  addDocument: PropTypes.func,
};

const select = (state) => ({
  exercises: sortExercises(R.values(state.referential.entities.exercises)),
  documents: sortDocuments(R.values(state.referential.entities.document)),
  tags: sortTags(R.values(state.referential.entities.tag)),
});

export default R.compose(
  connect(select, {
    fetchTags,
    fetchExercises,
    searchDocument,
    getDocument,
    getDocumentTags,
    getDocumentTagsExercise,
    addDocument,
  }),
  withStyles(styles),
)(DocumentGallery);
