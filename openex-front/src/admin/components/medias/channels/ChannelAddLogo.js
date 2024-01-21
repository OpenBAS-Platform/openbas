import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, ListItemIcon, Grid, Button } from '@mui/material';
import { DescriptionOutlined } from '@mui/icons-material';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';
import { storeHelper } from '../../../../actions/Schema';
import { fetchDocuments } from '../../../../actions/Document';
import CreateDocument from '../documents/CreateDocument';
import Transition from '../../../../components/common/Transition';
import TagsFilter from '../../../../components/TagsFilter';
import ItemTags from '../../../../components/ItemTags';

class ChannelAddLogo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      keyword: '',
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
    this.setState({ open: false, keyword: '' });
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

  submitAddLogo(documentId) {
    this.props.handleAddLogo(documentId);
    this.handleClose();
  }

  render() {
    const { t, documents } = this.props;
    const { keyword, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.document_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.document_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.document_type || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1;
    const filteredDocuments = R.pipe(
      R.filter((n) => n.document_type.includes('image/')),
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
        <Button
          variant="outlined"
          color="secondary"
          onClick={this.handleOpen.bind(this)}
          style={{ marginTop: 20 }}
        >
          {t('Change logo')}
        </Button>
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
          <DialogTitle>{t('Select an image')}</DialogTitle>
          <DialogContent>
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
                return (
                  <ListItem
                    key={document.document_id}
                    button={true}
                    divider={true}
                    dense={true}
                    onClick={this.submitAddLogo.bind(
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
                    <ItemTags variant="list" tags={document.document_tags} />
                  </ListItem>
                );
              })}
              <CreateDocument inline={true} image={true} />
            </List>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

ChannelAddLogo.propTypes = {
  t: PropTypes.func,
  fetchDocuments: PropTypes.func,
  documents: PropTypes.object,
  handleAddLogo: PropTypes.func,
};

const select = (state) => {
  const helper = storeHelper(state);
  const documents = helper.getDocumentsMap();
  return { documents };
};

export default R.compose(
  connect(select, { fetchDocuments }),
  inject18n,
)(ChannelAddLogo);
