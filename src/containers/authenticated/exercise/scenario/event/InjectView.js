import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import Theme from '../../../../../components/Theme'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import * as Constants from '../../../../../constants/ComponentTypes'
import {MainSmallListItem} from '../../../../../components/list/ListItem'
import {List} from '../../../../../components/List'
import {Icon} from '../../../../../components/Icon'

i18nRegister({
  fr: {
    'sender': 'Expéditeur',
    'body': 'Message',
    'encrypted': 'Chiffré',
    'attachments': 'Pièces jointes',
    'content': 'Contenu',
    'Target audiences': 'Audiences cibles',
    'All audiences': 'Toutes les audiences'
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
  },
  'audiences': {},
  'link': {
    color: Theme.palette.accent1Color,
    cursor: 'pointer'
  }
}

class InjectView extends Component {
  render() {
    let inject_content = JSON.parse(R.propOr(null, 'inject_content', this.props.inject))
    let inject_description = R.propOr('', 'inject_description', this.props.inject)
    let inject_fields = R.pipe(
      R.toPairs(),
      R.map(d => {
        return {key: R.head(d), value: R.last(d)}
      })
    )(inject_content)

    let displayedAsText = ['sender', 'subject', 'body', 'message', 'content']
    let displayedAsList = ['attachments']

    return (
      <div style={styles.container}>
        <div>
          <strong><T>Description</T></strong><br />
          <div>{inject_description}</div>
        </div>
        <br />
        {inject_fields.map(field => {
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
                let file_name = R.propOr('-', 'file_name', v)
                let file_id = R.propOr('-', 'file_id', v)
                return <div key={v.file_name} style={styles.link} dangerouslySetInnerHTML={{__html: file_name}} onClick={this.props.downloadAttachment.bind(this, file_id)}></div>
              })}
              <br />
            </div>
          } else {
            return ''
          }
        })}
        <div style={styles.audiences}>
          <strong><T>Target audiences</T></strong>
          {this.props.inject.inject_audiences.length === this.props.audiences.length ? <div>
              <T>All audiences</T>
            </div> :
          <List>
            {this.props.inject.inject_audiences.map(data => {
              let audience = R.find(a => a.audience_id === data.audience_id)(this.props.audiences)
              let audience_id = R.propOr('-', 'audience_id', audience)
              let audience_name = R.propOr('-', 'audience_name', audience)

              return (
                <MainSmallListItem
                  key={audience_id}
                  leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}
                  primaryText={audience_name}
                />
              )
            })}

            {this.props.inject.inject_subaudiences.map(data => {
              let subaudience = R.find(a => a.subaudience_id === data.subaudience_id)(this.props.subaudiences)
              let subaudience_id = R.propOr(data.subaudience_id, 'subaudience_id', subaudience)
              let audience = R.find(a => a.audience_id === subaudience.subaudience_audience.audience_id)(this.props.audiences)
              let audience_name = R.propOr('-', 'audience_name', audience)
              let subaudience_name = R.propOr('-', 'subaudience_name', subaudience)
              let subaudienceName = '[' + audience_name + '] ' + subaudience_name

              return (
                <MainSmallListItem
                  key={subaudience_id}
                  leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}
                  primaryText={subaudienceName}
                />
              )
            })}
          </List>}
        </div>
      </div>
    )
  }
}

InjectView.propTypes = {
  inject: PropTypes.object,
  subaudiences: PropTypes.array,
  audiences: PropTypes.array,
  downloadAttachment: PropTypes.func
}

export default InjectView