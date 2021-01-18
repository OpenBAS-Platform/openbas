import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import Theme from '../../../../../components/Theme';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';

i18nRegister({
  fr: {
    sender: 'Expéditeur',
    body: 'Message',
    encrypted: 'Chiffré',
    attachments: 'Pièces jointes',
    content: 'Contenu',
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
};

class DryinjectView extends Component {
  // eslint-disable-next-line class-methods-use-this
  readJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  render() {
    const dryinjectContent = this.readJSON(
      R.propOr(null, 'dryinject_content', this.props.dryinject),
    );
    const dryinjectDescription = R.propOr(
      '',
      'dryinject_description',
      this.props.dryinject,
    );

    const dryinjectFields = R.pipe(
      R.toPairs(),
      R.map((d) => ({ key: R.head(d), value: R.last(d) })),
    )(dryinjectContent);

    const displayedAsText = ['sender', 'subject', 'body', 'message', 'content'];
    const displayedAsList = ['attachments'];

    return (
      <div style={styles.container}>
        <div>
          <strong>
            <T>Description</T>
          </strong>
          <br />
          <div>{dryinjectDescription}</div>
        </div>
        <br />
        {dryinjectFields.map((field) => {
          if (R.indexOf(field.key, displayedAsText) !== -1) {
            return (
              <div key={field.key}>
                <strong>
                  <T>{field.key}</T>
                </strong>
                <br />
                <div dangerouslySetInnerHTML={{ __html: field.value }} />
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
      </div>
    );
  }
}

DryinjectView.propTypes = {
  dryinject: PropTypes.object,
  downloadAttachment: PropTypes.func,
};

export default DryinjectView;
