import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Add } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import DocumentForm from './DocumentForm';
import { addDocument, fetchDocument } from '../../../actions/Document';
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

const CreateDocument = (props) => {
  const { classes, t } = props;

  const [open, setOpen] = useState(false);

  const onSubmit = (data) => {
    const inputValues = R.pipe(
      R.assoc('document_tags', R.pluck('id', data.document_tags)),
    )(data);
    const formData = new FormData();
    formData.append('file', data.document_file[0]);
    const blob = new Blob([JSON.stringify(inputValues)], {
      type: 'application/json',
    });
    formData.append('input', blob);
    return props.addDocument(formData).then(() => setOpen(false));
  };

  return (
    <div>
      <Fab
        onClick={() => setOpen(true)}
        color="primary"
        aria-label="Add"
        className={classes.createButton}
      >
        <Add />
      </Fab>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        fullWidth={true}
        maxWidth="md"
        onClose={() => setOpen(false)}
      >
        <DialogTitle>{t('Create a new document')}</DialogTitle>
        <DialogContent>
          <DocumentForm
            onSubmit={onSubmit}
            initialValues={{ document_tags: [] }}
            handleClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

CreateDocument.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  addDocument: PropTypes.func,
  fetchDocument: PropTypes.func,
};

export default R.compose(
  connect(null, { addDocument, fetchDocument }),
  inject18n,
  withStyles(styles),
)(CreateDocument);
