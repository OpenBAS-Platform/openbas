import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../components/I18n'
import {i18nRegister} from '../../../utils/Messages'
import {fetchExercises} from '../../../actions/Exercise'
import {fetchUsers} from '../../../actions/User'
import {fetchGlobalInjects} from '../../../actions/Inject'

i18nRegister({
  fr: {
    'Exercices': 'Exercises',
    'Users': 'Utilisateurs',
    'Injects': 'Injects'
  }
})

const styles = {
  'container': {
    textAlign: 'center'
  },
  'stat': {
    display: 'inline-block',
    width: "200px",
  },
  'number': {
    fontSize: '20px',
    fontWeight: '400'
  },
  'name': {
    fontSize: ''
  }
}

class Index extends Component {
  componentDidMount() {
    this.props.fetchExercises()
    this.props.fetchUsers()
    this.props.fetchGlobalInjects()
  }

  render() {
    return <div style={styles.container}>
      <div style={styles.stat}>
        <div style={styles.number}>
          {this.props.exercises.length}
      </div>
        <div style={styles.name}>
          <T>Exercises</T>
        </div>
      </div>
    </div>
  }
}

Index.propTypes = {
  exercises: PropTypes.array,
  users: PropTypes.array,
  injects: PropTypes.array,
  fetchExercises: PropTypes.func,
  fetchUsers: PropTypes.func,
  fetchGlobalInjects: PropTypes.func
}

const select = (state) => {
  return {
    exercises: R.values(state.referential.entities.exercises),
    users: R.values(state.referential.entities.users),
    injects: R.values(state.referential.entities.injects)
  }
}

export default connect(select, {fetchExercises, fetchUsers, fetchGlobalInjects})(Index)
