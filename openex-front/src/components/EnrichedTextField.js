import React, { Component } from 'react';
import CKEditor4 from 'ckeditor4-react';
import * as PropTypes from 'prop-types';
import FormLabel from '@material-ui/core/FormLabel';
import { Field } from 'react-final-form';
import { injectIntl } from 'react-intl';

class renderCKEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.onEditorChange = this.onEditorChange.bind(this);
    CKEditor4.editorUrl = '/ckeditor/ckeditor.js';
  }

  onEditorChange(evt) {
    this.setState({ value: evt.editor.getData() });
    this.props.input.onChange(evt.editor.getData().toString('html'));
  }

  handleChange(changeEvent) {
    this.setState({ value: changeEvent.target.value });
  }

  render() {
    return (
      <div style={{ minHeight: 200 }}>
        <FormLabel>{this.props.label}</FormLabel>
        <CKEditor4
          data={this.props.input.value}
          onChange={this.onEditorChange}
        />
      </div>
    );
  }
}

renderCKEditor.propTypes = {
  input: PropTypes.object,
  label: PropTypes.string.isRequired,
};

const CKEditorFieldIntl = (props) => (
  <Field
    name={props.name}
    label={props.intl.formatMessage({ id: props.label })}
    component={renderCKEditor}
  />
);

CKEditorFieldIntl.propTypes = {
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

// eslint-disable-next-line import/prefer-default-export
export const EnrichedTextField = injectIntl(CKEditorFieldIntl);
