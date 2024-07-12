import React, { useState } from 'react';
import { Button, DialogActions, DialogContent, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { DescriptionOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../SearchFilter';
import TagsFilter from '../../admin/components/common/filters/TagsFilter';
import type { RawDocument } from '../../utils/api-types';
import ItemTags from '../ItemTags';
import CreateDocument from '../../admin/components/components/documents/CreateDocument';
import { useFormatter } from '../i18n';
import { useHelper } from '../../store';
import type { DocumentHelper, UserHelper } from '../../actions/helper';
import type { Theme } from '../Theme';
import Dialog from '../common/Dialog';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action?.hover,
    },
  },
}));

interface Props {
  extensions?: string[];
  label: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectDocument: (document: RawDocument | null) => void;
}

const FileTransferDialog: React.FC<Props> = ({ extensions, label, open, setOpen, onSelectDocument }) => {
  const classes = useStyles();

  const [keyword, setKeyword] = useState<string>('');
  const [tags, setTags] = useState<{ id: string, label: string, color: string }[]>([]);

  // Fetching data
  const { documents, userAdmin }: {
    documents: [RawDocument],
    userAdmin: string
  } = useHelper((helper: DocumentHelper & UserHelper) => ({
    documents: helper.getDocuments(),
    userAdmin: helper.getMe()?.user_admin,
  }));

  const filterByKeyword = (n: RawDocument) => keyword === ''
        || n.document_name?.toLowerCase().includes(keyword.toLowerCase())
        || n.document_description?.toLowerCase().includes(keyword.toLowerCase())
        || n.document_type?.toLowerCase().includes(keyword.toLowerCase());

  const filterByExtensions = (n: RawDocument) => extensions?.length === 0
        || extensions?.map((ext) => ext.toLowerCase()).includes(n.document_name?.split('.').pop()?.toLowerCase() || '');

  const filteredDocuments = documents.filter((doc) => {
    return (!tags.length || tags.every((tag) => doc.document_tags?.includes(tag.id)))
            && filterByKeyword(doc)
            && filterByExtensions(doc);
  }).slice(0, 10);

  const handleSearchDocuments = (value?: string) => {
    setKeyword(value || '');
  };

  const handleAddTag = (value: { id: string, label: string, color: string }) => {
    if (!tags.includes(value)) {
      setTags([...tags, value]);
    }
  };

  const handleClearTag = () => setTags([]);

  const handleClose = () => {
    setOpen(false);
    setTags([]);
    setKeyword('');
  };

  const addDocument = (document: RawDocument) => {
    onSelectDocument(document);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      handleClose={handleClose}
      title={label}
      maxWidth="lg"
    >
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <SearchFilter
              onChange={handleSearchDocuments}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TagsFilter
              onAddTag={handleAddTag}
              onClearTag={handleClearTag}
              currentTags={tags}
              fullWidth
            />
          </Grid>
        </Grid>
        <List>
          {filteredDocuments.map((document: RawDocument) => {
            return (
              <ListItem
                classes={{ root: classes.item }}
                key={document.document_id}
                divider
                onClick={() => addDocument(document)}
              >
                <ListItemIcon>
                  <DescriptionOutlined/>
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
              inline
              onCreate={addDocument}
            />
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default FileTransferDialog;
