import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import Theme from '../../../../components/Theme'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'

i18nRegister({
  fr: {
    'sender': 'Expéditeur',
    'body': 'Message',
    'encrypted': 'Chiffré',
    'attachments': 'Pièces jointes',
    'content': 'Contenu'
  },
  en: {
    'sender': 'Sender',
    'body': 'Message',
    'encrypted': 'Encrypted',
    'attachments': 'Attachments',
    'content': 'Content'
  }
})

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px'
  }
}

class DryinjectView extends Component {
  render() {
    let dryinject_content = JSON.parse(R.propOr(null, 'dryinject_content', this.props.dryinject))
    let dryinject_description = R.propOr('', 'dryinject_description', this.props.dryinject)

    let dryinject_fields = R.pipe(
      R.toPairs(),
      R.map(d => {
        return {key: R.head(d), value: R.last(d)}
      })
    )(dryinject_content)

    let displayedAsText = ['sender', 'subject', 'body', 'message', 'content']
    let displayedAsList = ['attachments']

    console.log(this.props.dryinject)
    return (
      <div style={styles.container}>
        <div>
          <strong><T>Description</T></strong><br />
          <div>{dryinject_description}</div>
        </div>
        <br />
        {dryinject_fields.map(field => {
          if (R.indexOf(field.key, displayedAsText) !== -1) {
            return <div key={field.key}>
              <strong><T>{field.key}</T></strong><br />
              <div dangerouslySetInnerHTML={{__html: field.value}}></div>
              <br />
            </div>
          } else if (R.indexOf(field.key, displayedAsList) !== -1) {
            return <div key={field.key}>
              <strong><T>{field.key}</T></strong><br />
              {field.value.map(v => {
                return <div key={v.file_name} dangerouslySetInnerHTML={{__html: v.file_name}}></div>
              })}
              <br />
            </div>
          } else {
            return ''
          }
        })}
      </div>
    )
  }
}

DryinjectView.propTypes = {
  dryinject: PropTypes.object,
}

export default DryinjectView