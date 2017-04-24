import React, {Component} from 'react'
import PropTypes from 'prop-types'
import R from 'ramda'
import Theme from '../../../../components/Theme'

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px'
  },
  'title': {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0px 0px 10px 0px'
  },
  'story': {
    textAlign: 'justify'
  }
}

class ObjectiveView extends Component {
  render() {
    let objective_description = R.propOr('-', 'objective_description', this.props.objective)
    return (
      <div style={styles.container}>
        <div style={styles.story}>{objective_description}</div>
      </div>
    )
  }
}

ObjectiveView.propTypes = {
  objective: PropTypes.object
}

export default ObjectiveView