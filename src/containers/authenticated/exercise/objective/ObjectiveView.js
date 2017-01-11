import React, {PropTypes, Component} from 'react'
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
    let objective_title = R.propOr('-', 'objective_title', this.props.objective)
    let objective_description = R.propOr('-', 'objective_description', this.props.objective)

    return (
      <div style={styles.container}>
        <div style={styles.title}>{objective_title}</div>
        <div style={styles.story}>{objective_description}</div>
      </div>
    )
  }
}

ObjectiveView.propTypes = {
  objective: PropTypes.object
}

export default ObjectiveView