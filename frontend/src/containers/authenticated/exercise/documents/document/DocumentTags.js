import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {T} from '../../../../../components/I18n'
import {i18nRegister} from '../../../../../utils/Messages'
import {TagListe, TagExerciseListe} from './../component/Tag'

i18nRegister({
  fr: {
      'Tags attributed to the document': 'Tags attribués au document',
      'Available Tags': 'Tags disponibles',
      'No Tag available': 'Pas de Tags disponibles'
  }
})

const styles = {
    'container': {
        textAlign: 'center',
        width: '100%',
        height: '400px'
    },
    'divGauche': {
        float: 'left',
        width: '47%',
        height: '100%',
        borderRadius: '4px'
    },
    'divDroite': {
        float: 'right',
        width: '47%',
        height: '100%',
        borderRadius: '4px'
    },
    'divTitle': {
        textAlign: 'center',
        fontWeight: '600',
        height: '5%'
    },
    'ssDivGauche': {
        width: '100%',
        border: '1px silver solid',
        height: '95%'
    },
    'ssDivDroite': {
        width: '100%',
        border: '1px silver solid',
        height: '95%'
    }
}

class DocumentTags extends Component {
  constructor(props) {
    super(props)
    this.state = {
        }
  }

  addDocumentTag(tag) {
    return this.props.handleAddDocumentTag(tag)
  }

  removeDocumentTag(tag) {
    return this.props.handleRemoveDocumentTag(tag)
  }

  removeDocumentTagExercise(exercise) {
    return this.props.handleRemoveDocumentTagExercise(exercise)
  }

  addDocumentTagExercise(exercise) {
    return this.props.handleAddDocumentTagExercise(exercise)
  }

  render() {
    return (
      <div style={styles.container}>
          <div style={styles.divGauche}>
          <div style={styles.divTitle}><T>Tags attributed to the document</T></div>
            <div style={styles.ssDivGauche}>
              {this.props.availables_tags.map(tag => {
                  let exist = false
                  this.props.document_tags.forEach(function(document_tags) {
                      if (document_tags === tag.tag_id) {exist = true}
                  })
                  if (exist === true) {
                      return (<TagListe key={tag.tag_id} value={tag.tag_name} onClick={this.removeDocumentTag.bind(this,tag)}/>)
                  } else {
                      return ("")
                  }
              })}
              {this.props.availables_exercises_tags.map(exercise => {
                  let exist = false
                  this.props.document_tags_exercise.forEach(function(document_tags) {
                      if (document_tags === exercise.exercise_id) {exist = true}
                  })
                  if (exist === true) {
                      return (
                        <TagExerciseListe
                          key={exercise.exercise_id}
                          value={exercise.exercise_name}
                          onClick={this.removeDocumentTagExercise.bind(this, exercise)}
                        />
                      )
                  } else {
                      return ("")
                  }
              })}
            </div>
          </div>
          <div style={styles.divDroite}>
            <div style={styles.divTitle}>Available Tags</div>
            <div style={styles.ssDivDroite}>
              {(this.props.availables_tags.length === 0 && this.props.availables_exercises_tags === 0) ? <div style={styles.empty}><T>No Tag available</T></div>:""}
              {this.props.availables_tags.map(tag => {
                  let exist = false
                  this.props.document_tags.forEach(function(document_tags) {
                    if (document_tags === tag.tag_id) {exist = true}
                  })
                  if (exist === false) {
                    return (
                      <TagListe
                        key={tag.tag_id}
                        value={tag.tag_name}
                        onClick={this.addDocumentTag.bind(this,tag)}
                      />
                    )
                  } else {
                    return ("")
                  }
              })}
              {this.props.availables_exercises_tags.map(exercise => {
                  let exist = false
                  this.props.document_tags_exercise.forEach(function(document_tags) {
                    if (document_tags === exercise.exercise_id) {exist = true}
                  })
                  if (exist === false) {
                    return (
                      <TagExerciseListe
                        key={exercise.exercise_id}
                        value={exercise.exercise_name}
                        onClick={this.addDocumentTagExercise.bind(this,exercise)}
                      />
                    )
                  } else {
                    return ("")
                  }
              })}
            </div>
          </div>
      </div>
    )
  }
}

DocumentTags.propTypes = {
  document_id: PropTypes.string, //document actuel
  document_tags: PropTypes.array, //Liste des tags du document,
  handleAddDocumentTag: PropTypes.func,
  handleRemoveDocumentTag: PropTypes.func,
  document_tags_exercise: PropTypes.array, //Liste des tags 'exercise' du document
  handleAddDocumentTagExercise: PropTypes.func,
  handleRemoveDocumentTagExercise: PropTypes.func,
  availables_tags: PropTypes.array, //Liste des tags disponible
  availables_exercises_tags: PropTypes.array //Liste des tags 'exercise' du document
}

export default connect(null, {})(DocumentTags)
