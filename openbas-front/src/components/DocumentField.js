import { Box } from '@mui/material';
import { FileOutline } from 'mdi-material-ui';
import * as R from 'ramda';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'tss-react/mui';

import { addDocument, fetchDocuments } from '../actions/Document';
import { storeHelper } from '../actions/Schema';
import Autocomplete from './Autocomplete';
import inject18n from './i18n';

const styles = () => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
});

class DocumentField extends Component {
  constructor(props) {
    super(props);
    this.state = { documentInput: '' };
  }

  componentDidMount() {
    this.props.fetchDocuments();
  }

  render() {
    const { t, name, documents, classes } = this.props;
    const documentsOptions = R.map(
      n => ({
        id: n.document_id,
        label: n.document_name,
      }),
      documents,
    );
    return (
      <Autocomplete
        variant="standard"
        size="small"
        name={name}
        fullWidth={true}
        multiple={false}
        label={t('Document')}
        options={documentsOptions}
        style={{ marginTop: 20 }}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <div className={classes.icon}>
              <FileOutline />
            </div>
            <div className={classes.text}>{option.label}</div>
          </Box>
        )}
        classes={{ clearIndicator: classes.autoCompleteIndicator }}
      />
    );
  }
}

const select = (state) => {
  const helper = storeHelper(state);
  return {
    documents: helper.getDocuments(),
  };
};

export default R.compose(
  connect(select, { fetchDocuments, addDocument }),
  inject18n,
  Component => withStyles(Component, styles),
)(DocumentField);
