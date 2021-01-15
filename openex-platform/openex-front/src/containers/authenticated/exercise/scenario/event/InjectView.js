import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import Theme from '../../../../../components/Theme';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import * as Constants from '../../../../../constants/ComponentTypes';
import { MainSmallListItem } from '../../../../../components/list/ListItem';
import { List } from '../../../../../components/List';
import { Icon } from '../../../../../components/Icon';

i18nRegister({
  fr: {
    sender: 'Expéditeur',
    body: 'Message',
    encrypted: 'Chiffré',
    attachments: 'Pièces jointes',
    content: 'Contenu',
    'Target audiences': 'Audiences cibles',
    'All audiences': 'Toutes les audiences',
  },
  en: {
    sender: 'Sender',
    body: 'Message',
    encrypted: 'Encrypted',
    attachments: 'Attachments',
    content: 'Content',
  },
});

const styles = {
  container: {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px',
  },
  audiences: {},
  link: {
    color: Theme.palette.accent1Color,
    cursor: 'pointer',
  },
};

class InjectView extends Component {
  // eslint-disable-next-line class-methods-use-this
  readJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  render() {
    const injectContent = this.readJSON(
      R.propOr(null, 'inject_content', this.props.inject),
    );
    const injectDescription = R.propOr(
      '',
      'inject_description',
      this.props.inject,
    );
    const injectFields = R.pipe(
      R.toPairs(),
      R.map((d) => ({ key: R.head(d), value: R.last(d) })),
    )(injectContent);

    const displayedAsText = ['sender', 'subject', 'body', 'message', 'content'];
    const displayedAsList = ['attachments'];

    return (
      <div style={styles.container}>
        <div>
          <strong>
            <T>Description</T>
          </strong>
          <br />
          <div>{injectDescription}</div>
        </div>
        <br />
        {injectFields.map((field) => {
          if (R.indexOf(field.key, displayedAsText) !== -1) {
            return (
              <div key={field.key}>
                <strong>
                  <T>{field.key}</T>
                </strong>
                <br />
                <div dangerouslySetInnerHTML={{ __html: field.value }}></div>
                <br />
              </div>
            );
          }
          if (R.indexOf(field.key, displayedAsList) !== -1) {
            return (
              <div key={field.key}>
                <strong>
                  <T>{field.key}</T>
                </strong>
                <br />
                {field.value.map((v) => {
                  const documentName = R.propOr('-', 'document_name', v);
                  const documentId = R.propOr('-', 'document_id', v);
                  return (
                    <div
                      key={v.document_name}
                      style={styles.link}
                      dangerouslySetInnerHTML={{ __html: documentName }}
                      onClick={this.props.downloadAttachment.bind(
                        this,
                        documentId,
                        documentName,
                      )}
                    ></div>
                  );
                })}
                <br />
              </div>
            );
          }
          return '';
        })}
        <div style={styles.audiences}>
          <strong>
            <T>Target audiences</T>
          </strong>
          {this.props.inject.inject_all_audiences === true ? (
            <div>
              <T>All audiences</T>
            </div>
          ) : (
            <List>
              {this.props.inject.inject_audiences.map((data) => {
                const audience = R.find(
                  (a) => a.audience_id === data.audience_id,
                )(this.props.audiences);
                const audienceId = R.propOr('-', 'audience_id', audience);
                const audienceName = R.propOr('-', 'audience_name', audience);

                return (
                  <MainSmallListItem
                    key={audienceId}
                    leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} />}
                    primaryText={audienceName}
                  />
                );
              })}

              {this.props.inject.inject_subaudiences.map((data) => {
                const subaudience = R.find(
                  (a) => a.subaudience_id === data.subaudience_id,
                )(this.props.subaudiences);
                const subaudienceId = R.propOr(
                  data.subaudience_id,
                  'subaudience_id',
                  subaudience,
                );
                const audience = R.find(
                  (a) => a.audience_id
                    === subaudience.subaudience_audience.audience_id,
                )(this.props.audiences);
                const audienceName = R.propOr('-', 'audience_name', audience);
                const subaudienceName = R.propOr(
                  '-',
                  'subaudience_name',
                  subaudience,
                );
                const finalSubaudienceName = `[${audienceName}] ${subaudienceName}`;
                return (
                  <MainSmallListItem
                    key={subaudienceId}
                    leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} />}
                    primaryText={finalSubaudienceName}
                  />
                );
              })}
            </List>
          )}
        </div>
      </div>
    );
  }
}

InjectView.propTypes = {
  inject: PropTypes.object,
  subaudiences: PropTypes.array,
  audiences: PropTypes.array,
  downloadAttachment: PropTypes.func,
};

export default InjectView;
