import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Button, Chip, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Box, ListItemIcon, Grid } from '@mui/material';
import { ControlPointOutlined, DescriptionOutlined } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import { fetchDocuments } from '../../../../actions/Document';
import CreateDocument from '../../medias/documents/CreateDocument';
import { truncate } from '../../../../utils/String';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import { Transition } from '../../../../utils/Environment';
import TagsFilter from '../../../../components/TagsFilter';
import ItemTags from '../../../../components/ItemTags';

const styles = (theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  box: {
    width: '100%',
    minHeight: '100%',
    padding: 20,
    border: '1px dashed rgba(255, 255, 255, 0.3)',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
});

class InjectAddDocuments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      keyword: '',
      documentsIds: [],
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchDocuments();
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false, keyword: '', documentsIds: [] });
  }

  handleSearchDocuments(value) {
    this.setState({ keyword: value });
  }

  handleAddTag(value) {
    if (value) {
      this.setState({ tags: [value] });
    }
  }

  handleClearTag() {
    this.setState({ tags: [] });
  }

  addDocument(documentId) {
    this.setState({
      documentsIds: R.append(documentId, this.state.documentsIds),
    });
  }

  removeDocument(documentId) {
    this.setState({
      documentsIds: R.filter((u) => u !== documentId, this.state.documentsIds),
    });
  }

  submitAddDocuments() {
    const { hasAttachments } = this.props;
    this.props.handleAddDocuments(
      this.state.documentsIds.map((n) => ({
        document_id: n,
        document_attached: hasAttachments,
      })),
    );
    this.handleClose();
  }

  onCreate(result) {
    this.addDocument(result);
  }

  render() {
    const {
      classes,
      t,
      documents,
      injectDocumentsIds,
      exerciseId,
      exercise,
      userAdmin,
    } = this.props;
    const { keyword, documentsIds, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.document_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.document_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.document_type || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1;
    const filteredDocuments = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.document_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      R.take(10),
    )(Object.values(documents));
    return (
      <div>
        <ListItem
          classes={{ root: classes.item }}
          button={true}
          divider={true}
          onClick={this.handleOpen.bind(this)}
          color="primary"
          disabled={isExerciseReadOnly(exercise)}
        >
          <ListItemIcon color="primary">
            <ControlPointOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('Add documents')}
            classes={{ primary: classes.text }}
          />
        </ListItem>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="lg"
          PaperProps={{
            elevation: 1,
            sx: {
              minHeight: 580,
              maxHeight: 580,
            },
          }}
        >
          <DialogTitle>{t('Add documents in this inject')}</DialogTitle>
          <DialogContent>
            <Grid container={true} spacing={3} style={{ marginTop: -15 }}>
              <Grid item={true} xs={8}>
                <Grid container={true} spacing={3}>
                  <Grid item={true} xs={6}>
                    <SearchFilter
                      onChange={this.handleSearchDocuments.bind(this)}
                      fullWidth={true}
                    />
                  </Grid>
                  <Grid item={true} xs={6}>
                    <TagsFilter
                      onAddTag={this.handleAddTag.bind(this)}
                      onClearTag={this.handleClearTag.bind(this)}
                      currentTags={tags}
                      fullWidth={true}
                    />
                  </Grid>
                </Grid>
                <List>
                  {filteredDocuments.map((document) => {
                    const disabled = documentsIds.includes(document.document_id)
                      || injectDocumentsIds.includes(document.document_id);
                    return (
                      <ListItem
                        key={document.document_id}
                        disabled={disabled}
                        button={true}
                        divider={true}
                        dense={true}
                        onClick={this.addDocument.bind(
                          this,
                          document.document_id,
                        )}
                      >
                        <ListItemIcon>
                          <DescriptionOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={document.document_name}
                          secondary={document.document_description}
                        />
                        <ItemTags
                          variant="list"
                          tags={document.document_tags}
                        />
                      </ListItem>
                    );
                  })}
                  {userAdmin && (
                    <CreateDocument
                      exerciseId={exerciseId}
                      inline={true}
                      onCreate={this.onCreate.bind(this)}
                    />
                  )}
                </List>
              </Grid>
              <Grid item={true} xs={4}>
                <Box className={classes.box}>
                  {this.state.documentsIds.map((documentId) => {
                    const document = documents[documentId];
                    return (
                      <Chip
                        key={documentId}
                        onDelete={this.removeDocument.bind(this, documentId)}
                        label={truncate(document.document_name, 22)}
                        icon={<DescriptionOutlined />}
                        classes={{ root: classes.chip }}
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose.bind(this)}>{t('Cancel')}</Button>
            <Button
              color="secondary"
              onClick={this.submitAddDocuments.bind(this)}
            >
              {t('Add')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

InjectAddDocuments.propTypes = {
  t: PropTypes.func,
  fetchDocuments: PropTypes.func,
  documents: PropTypes.object,
  injectDocumentsIds: PropTypes.array,
  handleAddDocuments: PropTypes.func,
  hasAttachments: PropTypes.bool,
  userAdmin: PropTypes.bool,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { exerciseId } = ownProps;
  const exercise = helper.getExercise(exerciseId);
  const documents = helper.getDocumentsMap();
  const userAdmin = helper.getMe()?.user_admin;
  return { exercise, documents, userAdmin };
};

export default R.compose(
  connect(select, { fetchDocuments }),
  inject18n,
  withStyles(styles),
)(InjectAddDocuments);
