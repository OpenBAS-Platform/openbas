import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { GroupOutlined } from '@mui/icons-material';
import Theme from '../../../../components/Theme';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';

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
    padding: '10px 0px 10px 0px',
  },
  audiences: {},
  link: {
    color: Theme.palette.secondary.main,
    cursor: 'pointer',
  },
};

class InjectView extends Component {
  render() {
    const injectContent = R.propOr(null, 'inject_content', this.props.inject);
    const injectDescription = this.props.inject?.inject_description ?? '';
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
                    />
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
              {this.props.inject.inject_audiences.map((id) => {
                const audience = R.find(
                  (a) => a.audience_id === id,
                )(this.props.audiences);
                const audienceId = R.propOr('-', 'audience_id', audience);
                const audienceName = R.propOr('-', 'audience_name', audience);

                return (
                  <ListItem key={audienceId} divider={true}>
                    <ListItemIcon>
                      <GroupOutlined />
                    </ListItemIcon>
                    <ListItemText primary={audienceName} />
                  </ListItem>
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
  audiences: PropTypes.array,
  downloadAttachment: PropTypes.func,
};

export default InjectView;
