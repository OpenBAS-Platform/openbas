import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide from '@mui/material/Slide';
import { MoreVert } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';

i18nRegister({
  fr: {
    Edit: 'Modifier',
    'List of TAGS': 'Liste des Tags',
    Delete: 'Supprimer',
    Download: 'Télécharger',
    'Delete Document': 'Supprimer un document',
    'Are you sure you want to delete this document?':
      'Êtes vous sûr de vouloir supprimer ce document ?',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = (theme) => ({
  container: {
    margin: 0,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

class DocumentActionPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      openConfirmDelete: false,
    };
  }

  handlePopoverOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleCloseOpenConfirmDelete() {
    this.setState({ openConfirmDelete: false });
  }

  handleOpenConfirmDelete() {
    this.handlePopoverClose();
    this.setState({ openConfirmDelete: true });
  }

  editDocument() {
    this.handlePopoverClose();
    return this.props.handleEditDocument(this.props.document);
  }

  viewDocument() {
    this.handlePopoverClose();
    return this.props.handleViewDocument(this.props.document);
  }

  editDocumentTag() {
    this.handlePopoverClose();
    return this.props.handleEditDocumentTag(this.props.document.document_id);
  }

  deleteDocument() {
    this.handleCloseOpenConfirmDelete();
    return this.props.handleDeleteDocument(this.props.document);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            onClick={this.editDocument.bind(this)}
            disabled={!this.props.userCanUpdate}
          >
            <T>Edit</T>
          </MenuItem>
          <MenuItem onClick={this.viewDocument.bind(this)}>
            <T>Download</T>
          </MenuItem>
          <MenuItem
            onClick={this.editDocumentTag.bind(this)}
            disabled={!this.props.userCanUpdate}
          >
            <T>List of tags</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenConfirmDelete.bind(this)}
            disabled={!this.props.userCanUpdate}
          >
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openConfirmDelete}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseOpenConfirmDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Are you sure you want to delete this document?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseOpenConfirmDelete.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              onClick={this.deleteDocument.bind(this)}
              color="secondary"
            >
              <T>Delete</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DocumentActionPopover.propTypes = {
  document_id: PropTypes.string,
  document: PropTypes.object,
  documents: PropTypes.object,
  handleEditDocument: PropTypes.func,
  handleViewDocument: PropTypes.func,
  handleEditDocumentTag: PropTypes.func,
  handleDeleteDocument: PropTypes.func,
  userCanUpdate: PropTypes.bool,
};

const select = (state) => ({
  documents: state.referential.entities.document,
});

export default R.compose(
  connect(select, {}),
  withStyles(styles),
)(DocumentActionPopover);
