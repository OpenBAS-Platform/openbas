import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Add } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import DocumentForm from './DocumentForm';
import {
  addDocument,
  fetchDocument,
  updateDocument,
} from '../../../actions/Document';
import inject18n from '../../../components/i18n';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

class CreateDocument extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  onSubmit(data) {
    const inputValues = R.pipe(
      R.assoc('document_tags', R.pluck('id', data.document_tags)),
    )(data);
    const formData = new FormData();
    formData.append('file', data.document_file[0]);
    this.props.addDocument(formData).then((document) => {
      this.props.fetchDocument(document.result).then((finalDocument) => {
        this.props.updateDocument(document.result, {
          ...finalDocument,
          ...inputValues,
        });
      });
    });
  }

  render() {
    const { classes, t } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
        >
          <DialogTitle>{t('Create a new document')}</DialogTitle>
          <DialogContent>
            <DocumentForm
              onSubmit={this.onSubmit.bind(this)}
              initialValues={{ document_tags: [] }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={this.handleClose.bind(this)}
              color="secondary"
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              form="documentForm"
            >
              {t('Create')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateDocument.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  addDocument: PropTypes.func,
  fetchDocument: PropTypes.func,
  updateDocument: PropTypes.func,
};

export default R.compose(
  connect(null, { addDocument, fetchDocument, updateDocument }),
  inject18n,
  withStyles(styles),
)(CreateDocument);
