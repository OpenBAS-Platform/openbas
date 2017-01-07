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

class AudienceView extends Component {

  render() {
    let audience_name = R.propOr('-', 'objective_title', this.props.audience)

    return (
      <div style={styles.container}>
        <div style={styles.title}>{audience_name}</div>
      </div>
    )
  }
}

AudienceView.propTypes = {
  audience: PropTypes.object
}

export default AudienceView