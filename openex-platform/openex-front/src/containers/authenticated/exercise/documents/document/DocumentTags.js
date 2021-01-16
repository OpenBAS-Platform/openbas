import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';

i18nRegister({
  fr: {
    'Tags attributed to the document': 'Tags attribués au document',
    'Available Tags': 'Tags disponibles',
    'No Tag available': 'Pas de Tags disponibles',
  },
});

const styles = () => ({
  container: {
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  divGauche: {
    float: 'left',
    width: '47%',
    height: '100%',
    borderRadius: '4px',
  },
  divDroite: {
    float: 'right',
    width: '47%',
    height: '100%',
    borderRadius: '4px',
  },
  divTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },
  ssDivGauche: {
    width: '100%',
    border: '1px silver solid',
    height: '95%',
    padding: '10px 5px 10px 5px',
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: '0 4px 10px 4px',
    },
  },
  ssDivDroite: {
    width: '100%',
    border: '1px silver solid',
    height: '95%',
    padding: '10px 5px 10px 5px',
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: '0 4px 10px 4px',
    },
  },
});

class DocumentTags extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  addDocumentTag(tag) {
    return this.props.handleAddDocumentTag(tag);
  }

  removeDocumentTag(tag) {
    return this.props.handleRemoveDocumentTag(tag);
  }

  removeDocumentTagExercise(exercise) {
    return this.props.handleRemoveDocumentTagExercise(exercise);
  }

  addDocumentTagExercise(exercise) {
    return this.props.handleAddDocumentTagExercise(exercise);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <div className={classes.divGauche}>
          <div className={classes.divTitle}>
            <T>Tags attributed to the document</T>
          </div>
          <div className={classes.ssDivGauche}>
            {this.props.availables_tags.map((tag) => {
              let exist = false;
              this.props.document_tags.forEach((documentTags) => {
                if (documentTags === tag.tag_id) {
                  exist = true;
                }
              });
              if (exist === true) {
                return (
                  <Chip
                    key={tag.tag_id}
                    className={classes.tag}
                    variant="outlined"
                    color="primary"
                    label={tag.tag_name}
                    onClick={this.removeDocumentTag.bind(this, tag)}
                  />
                );
              }
              return '';
            })}
            {this.props.availables_exercises_tags.map((exercise) => {
              let exist = false;
              this.props.document_tags_exercise.forEach((documentTags) => {
                if (documentTags === exercise.exercise_id) {
                  exist = true;
                }
              });
              if (exist === true) {
                return (
                  <Chip
                    key={exercise.exercise_id}
                    className={classes.tag}
                    variant="outlined"
                    color="primary"
                    label={exercise.exercise_name}
                    onClick={this.removeDocumentTagExercise.bind(
                      this,
                      exercise,
                    )}
                  />
                );
              }
              return '';
            })}
          </div>
        </div>
        <div className={classes.divDroite}>
          <div className={classes.divTitle}>Available Tags</div>
          <div className={classes.ssDivDroite}>
            {this.props.availables_tags.length === 0
              && this.props.availables_exercises_tags === 0 && (
                <div className={classes.empty}>
                  <T>No Tag available</T>
                </div>
            )}
            {this.props.availables_tags.map((tag) => {
              let exist = false;
              this.props.document_tags.forEach((documentTags) => {
                if (documentTags === tag.tag_id) {
                  exist = true;
                }
              });
              if (exist === false) {
                return (
                  <Chip
                    key={tag.tag_id}
                    className={classes.tag}
                    variant="outlined"
                    color="primary"
                    label={tag.tag_name}
                    onClick={this.addDocumentTag.bind(this, tag)}
                  />
                );
              }
              return '';
            })}
            {this.props.availables_exercises_tags.map((exercise) => {
              let exist = false;
              this.props.document_tags_exercise.forEach((documentTags) => {
                if (documentTags === exercise.exercise_id) {
                  exist = true;
                }
              });
              if (exist === false) {
                return (
                  <Chip
                    key={exercise.exercise_id}
                    className={classes.tag}
                    variant="outlined"
                    color="primary"
                    label={exercise.exercise_name}
                    onClick={this.addDocumentTagExercise.bind(this, exercise)}
                  />
                );
              }
              return '';
            })}
          </div>
        </div>
      </div>
    );
  }
}

DocumentTags.propTypes = {
  document_id: PropTypes.string, // document actuel
  document_tags: PropTypes.array, // Liste des tags du document,
  handleAddDocumentTag: PropTypes.func,
  handleRemoveDocumentTag: PropTypes.func,
  document_tags_exercise: PropTypes.array, // Liste des tags 'exercise' du document
  handleAddDocumentTagExercise: PropTypes.func,
  handleRemoveDocumentTagExercise: PropTypes.func,
  availables_tags: PropTypes.array, // Liste des tags disponible
  availables_exercises_tags: PropTypes.array, // Liste des tags 'exercise' du document
};

export default R.compose(connect(null, {}), withStyles(styles))(DocumentTags);
