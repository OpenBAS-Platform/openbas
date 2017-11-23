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

class LogView extends Component {

  render() {
    let log_title = R.propOr('-', 'log_title', this.props.log)
    let log_content = R.propOr('-', 'log_content', this.props.log)

    return (
      <div style={styles.container}>
        <div style={styles.title}>{log_title}</div>
        <div style={styles.story}>{log_content}</div>
      </div>
    )
  }
}

LogView.propTypes = {
  log: PropTypes.object
}

export default LogView