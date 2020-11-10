import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {T} from '../../components/I18n'
import {i18nRegister} from '../../utils/Messages'
import {timeDiff} from '../../utils/Time'
import * as Constants from '../../constants/ComponentTypes'
import * as R from 'ramda'
import {SearchField} from '../../components/SimpleTextField'
import {fetchTags} from '../../actions/Tag'
import {addDocument, searchDocument, getDocument, getDocumentTags, getDocumentTagsExercise} from '../../actions/Document'
import {fetchExercises} from '../../actions/Exercise'
import {TagListe, TagExerciseListe, TagAddToFilter, TagSmallListe, TagSmallExerciseListe} from '../authenticated/exercise/documents/component/Tag'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {FlatButton} from '../../components/Button'

const styles = {
    'container': {
        textAlign: 'center',
        marginTop: '20px'
    },
    'title': {
        float: 'left',
        fontSize: '13px',
        textTransform: 'uppercase'
    },
    'titlePopover': {
        float: 'left',
        fontSize: '11px',
        height: '35px',
        textTransform: 'uppercase'
    },
    'columnLeft': {
        float: 'left',
        width: '49%',
        margin: 0,
        padding: 0,
        textAlign: 'left'
    },
    'columnRight': {
        float: 'right',
        width: '49%',
        margin: 0,
        padding: 0,
        textAlign: 'left'
    },
    'searchDiv': {
        float: 'left',
        marginTop: '10px',
        width: '100%',
        border: '1px silver solid',
        borderRadius: '4px',
        paddingBottom: '10px'
    },
    'searchDivTag': {
        float: 'left',
        width: '10%',
        marginTop: '10px',
        minWidth: '120px'
    },
    searchDivTagDetail: {
        float: 'left',
        marginTop: '10px',
        width: '89%',
        textAlign: 'left'
    },
    searchDivTagLibelle: {
        float: 'left',
        border: '0px',
        width: '100%',
        textAlign: 'left'
    },
    searchDivTitle: {
        marginTop: '10px',
        fontSize: '13px',
        textAlign: 'left'
    },
    'divDocumentsListe': {
        float: 'left',
        width: '79%',
        minHeight: '400px',
        height: '100%'
    },
    divDocumentsListeDetail: {
        width: '100%',
        height: '100%',
        minHeight: '340px',
        maxHeight: '340px',
        overflowY: 'auto',
        border: '1px silver solid',
        borderRadius: '4px'
    },
    'divTagsListe': {
        float: 'right',
        width: '20%',
        minHeight: '400px',
        height: '100%'
    },
    'divTagsListeDetail': {
        width: '100%',
        height: '100%',
        minHeight: '340px',
        maxHeight: '340px',
        overflowY: 'auto',
        border: '1px silver solid',
        borderRadius: '4px'
    },
    'divDocuments': {
        marginTop: '20px',
        width: '100%',
        minHeight: '400px'
    },
    'divDocumentsTitle': {
        fontSize: '15px',
        textTransform: 'uppercase',
        fontWeight: '800'
    },
    'search': {
        float: 'right'
    },
    empty: {
        marginTop: 40,
        fontSize: '18px',
        fontWeight: 500,
        textAlign: 'center'
    }
}

i18nRegister({
  fr: {
      'Search by :': 'Rechercher par :',
      'No added tags, select a tag from the list on the right to add it as a filter.': 'Aucun tag ajouté, sélectionner un tag sur la liste de droite pour l\'ajouter comme filtre.',
      'List of Documents': 'Liste des documents',
      'No Document available': 'Aucun document de disponible',
      'List of documents including the following tags : ': 'Liste des documents incluant les Tags suivants : '
  }
})

class DocumentGallery extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchTerm: '',
      listeTagAddToFilter: [],
      listeTagExerciseAddToFilter: [],
      documentsTags: [],
      documentsTagsExercise: []
    }
  }

  componentDidMount() {
    this.props.fetchTags();
    this.props.fetchExercises();
    this.props.searchDocument(null);
  }

  openFileDialog() {
    this.refs.fileUpload.click()
  }

  handleFileChange() {
      let data = new FormData();
      data.append('file', this.refs.fileUpload.files[0])
      this.props.addDocument(data).then(document_id => {
        this.props.getDocument(document_id.result).then(document => {
          this.handleEditDocument(R.prop(document.result, document.entities.document))
        })
      })
    }

  handleEditDocument(document) {
    this.setState({
      selectedDocument: document,
      openEditDocument: true
    })
  }

  handleSearchDocument(event, value) {
    this.setState({searchTerm: value})
  }

  addAvailableTagToFilter(tag) {
    let listeTagAddToFilter = [...this.state.listeTagAddToFilter]
    let allreadyExist = false
    listeTagAddToFilter.forEach(function(element) {
      if (element.tag_id === tag.tag_id) {
        allreadyExist = true
      }
    });
    if (allreadyExist === false) {
      listeTagAddToFilter.push({tag_id: tag.tag_id, tag_name: tag.tag_name})
      this.setState({listeTagAddToFilter: listeTagAddToFilter});
    } else {
      this.removeTagToFilter(tag)
    }
  }

  handleFileSelector(document) {
    this.props.fileSelector(document)
  }

  addAvailableTagExerciseToFilter(exercise) {
    let listeTagExerciseAddToFilter = [...this.state.listeTagExerciseAddToFilter]
    let allreadyExist = false
    listeTagExerciseAddToFilter.forEach(function(element) {
      if (element.exercise_id === exercise.exercise_id) {
        allreadyExist = true
      }
    });
    if (allreadyExist === false) {
      listeTagExerciseAddToFilter.push({exercise_id: exercise.exercise_id, exercise_name: exercise.exercise_name})
      this.setState({listeTagExerciseAddToFilter: listeTagExerciseAddToFilter})
    } else {
      this.removeTagExerciseToFilter(exercise)
    }
  }

  removeTagToFilter(tag) {
    let listeTagAddToFilter = [...this.state.listeTagAddToFilter]
    let newListeTagAddToFilter = []
    listeTagAddToFilter.forEach(function(element) {
      if (element.tag_id !== tag.tag_id) {
        newListeTagAddToFilter.push(element)
      }
    });
    this.setState({listeTagAddToFilter: newListeTagAddToFilter})
  }

  removeTagExerciseToFilter(exercise) {
    let listeTagExerciseAddToFilter = [...this.state.listeTagExerciseAddToFilter]
    let newListeTagExerciseAddToFilter = []
    listeTagExerciseAddToFilter.forEach(function(element) {
      if (element.exercise_id !== exercise.exercise_id) {
        newListeTagExerciseAddToFilter.push(element)
      }
    });
    this.setState({listeTagExerciseAddToFilter: newListeTagExerciseAddToFilter})
  }

  checkIfDocumentIsDisplay(document, listeTagAddToFilter, listeTagExerciseAddToFilter, keyWords) {
    let toDisplay = true
    let listeTagCritere = []
    let listeTagExerciseCritere = []

    if (keyWords !== '') {
      if (document.document_name.toLowerCase().indexOf(keyWords.toLowerCase()) === -1) {
        toDisplay = false
      }
    }
    if (toDisplay === true) {
      //pour chaque tag de la recherche
      listeTagAddToFilter.forEach(function (tagCritere) {
        let exist = false
        //pour chaque tag document
        document.document_liste_tags.forEach(function(tagDocument) {
          if (tagDocument.tag_id === tagCritere.tag_id) {
            exist = true
          }
        })
        listeTagCritere.push({'tag_id': tagCritere.tag_id, 'exist': exist})
      })
      //pour chaque tag exercice
      listeTagExerciseAddToFilter.forEach(function (tagExerciseCritere) {
        let exist = false
        document.document_liste_tags_exercise.forEach(function(tagDocument) {
          if (tagDocument.exercise_id === tagExerciseCritere.exercise_id) {
            exist = true
          }
        })
        listeTagExerciseCritere.push({'exercise_id': tagExerciseCritere.exercise_id, 'exist': exist})
      })

      for (let i = 0; i < listeTagCritere.length; i++) {
        if (listeTagCritere[i].exist === false) {
          toDisplay = false;
        }
      }
      for (let i = 0; i < listeTagExerciseCritere.length; i++) {
        if (listeTagExerciseCritere[i].exist === false) {
          toDisplay = false;
        }
      }
    }
    return toDisplay
  }

  render() {
    return (
        <div style={styles.container}>
          <div style={styles.columnLeft}></div>
          <div style={styles.columnRight}>
            <div style={styles.search}>
              <SearchField
                name="keyword"
                fullWidth={true}
                type="text"
                hintText="Search"
                onChange={this.handleSearchDocument.bind(this)}
                styletype={Constants.FIELD_TYPE_RIGHT}
              />
            </div>
            <div className="clearfix"></div>
          </div>
          <div className="clearfix"></div>
          <div style={styles.searchDivTitle}>
            <T>Search by</T>
          </div>
          <div style={styles.searchDiv}>
            <div style={styles.searchDivTag}>
              <T>Tag :</T>
            </div>
            <div style={styles.searchDivTagDetail}>
              {(this.state.listeTagAddToFilter.length === 0 && this.state.listeTagExerciseAddToFilter.length === 0) ? <T>No added tags, select a tag from the list on the right to add it as a filter.</T>: ""}
              {R.values(this.state.listeTagExerciseAddToFilter).map(exercise => {
                return (<TagAddToFilter value={exercise.exercise_name} onRequestDelete={this.removeTagExerciseToFilter.bind(this, exercise)}/>)
              })}
              {R.values(this.state.listeTagAddToFilter).map(tag => {
                return (<TagAddToFilter value={tag.tag_name} onRequestDelete={this.removeTagToFilter.bind(this, tag)}/>)
              })}
              <div className="clearfix"></div>
              {(this.state.listeTagAddToFilter.length !== 0 || this.state.listeTagExerciseAddToFilter.length !== 0) ?
              <div style={styles.searchDivTagLibelle}>
                <T>List of documents including the following tags : </T>
                {R.values(this.state.listeTagExerciseAddToFilter).map(exercise => {
                  return (exercise.exercise_name+', ')
                })}
                {R.values(this.state.listeTagAddToFilter).map(tag => {
                  return (tag.tag_name+', ')
                })}
              </div>
              : ""}
            </div>
          </div>
          <div className="clearfix"></div>
          <div style={styles.divDocuments}>
            <div style={styles.divDocumentsListe}>
              <div style={styles.divDocumentsTitle}>
                <T>List of Documents</T>
              </div>
              <div style={styles.divDocumentsListeDetail}>
                {this.props.documents.length === 0 ? <div style={styles.empty}><T>No Document available</T></div>:""}
                <Table selectable={false} style={{marginTop: '5px'}}>
                  <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                    <TableRow>
                      <TableHeaderColumn style={{width: '100px'}}></TableHeaderColumn>
                      <TableHeaderColumn><T>Name</T></TableHeaderColumn>
                      <TableHeaderColumn><T>Description</T></TableHeaderColumn>
                      <TableHeaderColumn><T>Tags</T></TableHeaderColumn>
                    </TableRow>
                  </TableHeader>
                  <TableBody displayRowCheckbox={false}>
                  {this.props.documents.map((document, index) => {
                    let listeTagAddToFilter = [...this.state.listeTagAddToFilter]
                    let listeTagExerciseAddToFilter = [...this.state.listeTagExerciseAddToFilter]
                    let toDisplay = this.checkIfDocumentIsDisplay(document, listeTagAddToFilter, listeTagExerciseAddToFilter, this.state.searchTerm)
                    return (
                      (toDisplay === true) ?
                        <TableRow>
                          <TableRowColumn style={{width:'100px'}}>
                            <input
                            type="radio"
                            name="radio_select_document"
                            onClick={this.handleFileSelector.bind(this, document)}
                          />
                          </TableRowColumn>
                          <TableRowColumn>{document.document_name}</TableRowColumn>
                          <TableRowColumn style={{wordWrap: 'break-word', whiteSpace: 'normal'}}>
                            {document.document_description}
                          </TableRowColumn>
                          <TableRowColumn>
                            {document.document_liste_tags.map(tag => {
                              return (<TagSmallListe value={tag.tag_name}/>)
                            })}
                            {document.document_liste_tags_exercise.map(exercise => {
                              return (<TagSmallExerciseListe value={exercise.exercise_name}/>)
                            })}
                          </TableRowColumn>
                        </TableRow>
                      : ""
                    )
                  })}
                  </TableBody>
                </Table>
              </div>
              <FlatButton label="Add new document" primary={true} onClick={this.openFileDialog.bind(this)}/>
            </div>
            <div style={styles.divTagsListe}>
              <div style={styles.divDocumentsTitle}><T>Liste des tags</T></div>
              <div style={styles.divTagsListeDetail}>
                {(this.props.tags.length === 0 && this.props.exercises === 0) ? <div style={styles.empty}><T>Aucun TAG de disponible.</T></div>:""}
                {this.props.tags.map(tag => {
                  return (<TagListe value={tag.tag_name} onClick={this.addAvailableTagToFilter.bind(this, tag)}/>)
                })}
                {this.props.exercises.map(exercise => {
                  return (<TagExerciseListe value={exercise.exercise_name} onClick={this.addAvailableTagExerciseToFilter.bind(this, exercise)}/>)
                })}
              </div>
            </div>
          </div>
          <input
            type="file"
            ref="fileUpload"
            style={{"display": "none"}}
            onChange={this.handleFileChange.bind(this)}
          />
        </div>
      )
    }
}

const sortTags = (tags) => {
  let tagsSorting = R.pipe(
    R.sort((a, b) => a.tag_name > b.tag_name)
  )
  return tagsSorting(tags)
}

const sortExercises = (exercises) => {
  let exercisesSorting = R.pipe(
    R.sort((a, b) => timeDiff(a.exercise_start_date, b.exercise_start_date))
  )
  return exercisesSorting(exercises)
}

const sortDocuments = (documents) => {
  let documentsSorting = R.pipe(
    R.sort((a, b) => a.document_name > b.document_name)
  )
  return documentsSorting(documents)
}

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
  addDocument: PropTypes.func
}

const select = (state, ownProps) => {
  return {
    'exercises': sortExercises(R.values(state.referential.entities.exercises)),
    'documents': sortDocuments(R.values(state.referential.entities.document)),
    'tags': sortTags(R.values(state.referential.entities.tag))}
}

export default connect(select, {
  fetchTags,
  fetchExercises,
  searchDocument,
  getDocument,
  getDocumentTags,
  getDocumentTagsExercise,
  addDocument
})(DocumentGallery)
