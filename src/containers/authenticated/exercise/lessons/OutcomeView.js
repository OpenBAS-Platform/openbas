import React, {Component} from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'
import Theme from '../../../../components/Theme'

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px'
  },
  'title': {
    fontSize: '16px',
    fontWeight: '500'
  },
  'story': {

  }
}

class OutcomeView extends Component {

  render() {
    let outcome_result = R.pathOr('-', ['incident_outcome', 'outcome_result'], this.props.incident)
    let outcome_comment = R.pathOr('-', ['incident_outcome', 'outcome_comment'], this.props.incident)

    return (
      <div style={styles.container}>
        <div style={styles.title}>{outcome_result}</div>
        <div style={styles.story}>{outcome_comment}</div>
      </div>
    )
  }
}

OutcomeView.propTypes = {
  incident: PropTypes.object
}

export default OutcomeView