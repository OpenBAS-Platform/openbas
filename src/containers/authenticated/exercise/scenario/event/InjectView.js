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
    let inject_content = JSON.parse(R.propOr(null, 'inject_content', this.props.inject))

    let inject_fields = R.pipe(
      R.toPairs(),
      R.map(d => {return {key: R.head(d), value: R.last(d)}})
    )(inject_content)

    return (
      <div style={styles.container}>
        <h3>{inject_title}</h3>
        {inject_fields.map(field => {
          return <div>
            <strong>{field.key}</strong><br /><br />
            {field.value}
          </div>
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