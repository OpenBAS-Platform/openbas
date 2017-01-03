import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'

i18nRegister({
  fr: {
    'Inject view': 'Vue de l\'inject',
  }
})

const styles = {
  'container': {
    padding: '10px'
  }
}

class InjectView extends Component {
  render() {
    let inject_title = R.propOr('-', 'inject_title', this.props.inject)
    return (
      <div style={styles.container}>
        {inject_title}
      </div>
    )
  }
}

InjectView.propTypes = {
  inject: PropTypes.object,
  injectContent: PropTypes.object
}

export default InjectView