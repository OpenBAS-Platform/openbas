import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import {T} from '../../../../../components/I18n'
import Theme from '../../../../../components/Theme'

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px'
  },
  'title': {
    fontSize: '16px',
    fontWeight: '500'
  },
  'type': {
    color: Theme.palette.disabledColor,
    fontSize: '14px',
    margin: '0px 0px 10px 0px',
  },
  'story': {

  }
}

class InjectStatusView extends Component {

  render() {
    let inject_status = R.propOr('-', 'inject_status', this.props.inject)
    console.log(inject_status)

    return (
      <div style={styles.container}>

      </div>
    )
  }
}

InjectStatusView.propTypes = {
  inject: PropTypes.object
}

export default InjectStatusView