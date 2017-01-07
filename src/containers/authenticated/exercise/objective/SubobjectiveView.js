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
    fontWeight: '500'
  },
  'story': {

  }
}

class SubobjectiveView extends Component {

  render() {
    let subobjective_title = R.propOr('-', 'subobjective_title', this.props.subobjective)
    let subobjective_description = R.propOr('-', 'subobjective_description', this.props.subobjective)

    return (
      <div style={styles.container}>
        <div style={styles.title}>{subobjective_title}</div>
        <div style={styles.story}>{subobjective_description}</div>
      </div>
    )
  }
}

SubobjectiveView.propTypes = {
  subobjective: PropTypes.object
}

export default SubobjectiveView