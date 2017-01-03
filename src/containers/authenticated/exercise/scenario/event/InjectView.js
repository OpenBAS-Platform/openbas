import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'

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
    let inject_content = R.values(JSON.parse(R.propOr(null, 'inject_content', this.props.inject)))

    return (
      <div style={styles.container}>
        <h3>{inject_title}</h3>
        {inject_content.map(content => {
          return <div>{content}<br /><br /></div>
        })}
      </div>
    )
  }
}

InjectView.propTypes = {
  inject: PropTypes.object,
  injectContent: PropTypes.object
}

export default InjectView