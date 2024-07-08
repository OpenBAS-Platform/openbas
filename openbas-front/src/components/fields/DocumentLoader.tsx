import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DescriptionOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { useAppDispatch } from '../../utils/hooks';
import useDataLoader from '../../utils/hooks/useDataLoader';
import type { Document } from '../../utils/api-types';
import { useHelper } from '../../store';
import type { DocumentHelper, UserHelper } from '../../actions/helper';
import { fetchDocuments } from '../../actions/Document';
import Transition from '../common/Transition';
import SearchFilter from '../SearchFilter';
import TagsFilter from '../../admin/components/common/filters/TagsFilter';
import ItemTags from '../ItemTags';
import CreateDocument from '../../admin/components/components/documents/CreateDocument';
import type { Theme } from '../Theme';
import { useFormatter } from '../i18n';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {
  name: string;
  label: string;
  extensions?: string[];
  setFieldValue: (field: string, value: any) => void;
}

const DocumentLoader: React.FC<Props> = ({ name, label, extensions = [], setFieldValue }) => {
  const classes = useStyles();
  const { t } = useFormatter();

  // Fetching data
  const { documents, userAdmin }: { documents: [Document], userAdmin: string } = useHelper((helper: DocumentHelper & UserHelper) => ({
    documents: helper.getDocuments(),
    userAdmin: helper.getMe()?.user_admin,
  }));
  const dispatch = useAppDispatch();
  useDataLoader(() => {
    dispatch(fetchDocuments());
  });

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (selectedDocument) {
      setFieldValue(name, selectedDocument);
    }
  }, [selectedDocument, setFieldValue]);

  const filterByKeyword = (n: Document) => keyword === ''
      || R.anyPass([
        R.pipe(R.toLower, R.includes(R.toLower(keyword))), // Check document_name
        R.pipe(R.propOr('', 'document_description'), R.toLower, R.includes(R.toLower(keyword))), // Check document_description
        R.pipe(R.propOr('', 'document_type'), R.toLower, R.includes(R.toLower(keyword))), // Check document_type
      ])(n);

  const filterByExtensions = (n: Document) => extensions.length === 0
      || R.contains(R.pipe(R.split('.'), R.last, R.toLower)(n.document_name), extensions.map(R.toLower));

  const filteredDocuments = R.pipe(
    R.filter(R.allPass([
      (n) => tags.length === 0 || R.any((tag) => R.contains(tag, n.document_tags || []), tags),
      filterByKeyword,
      filterByExtensions,
    ])),
    R.take(10),
  )(documents);

  const handleClose = () => {
    setOpen(false);
    setKeyword('');
  };

  const handleSearchDocuments = (value?: string) => {
    setKeyword(value || '');
  };

  const handleAddTag = (value: string) => {
    if (!tags.includes(value)) {
      setTags([...tags, value]);
    }
  };

  const handleClearTag = () => setTags([]);

  const addDocument = (document: Document) => {
    setSelectedDocument(document);
    handleClose();
  };

  const onCreate = (result: Document) => {
  };

  return (
    <>
      <TextField
        label={label}
        value={selectedDocument ? selectedDocument.document_name : ''}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
        onClick={() => setOpen(true)}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          elevation: 1,
          sx: {
            minHeight: 580,
            maxHeight: 580,
          },
        }}
      >
        <DialogTitle>{t(label)}</DialogTitle>
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
            {filteredDocuments.map((document: Document) => {
              return (
                <ListItem
                  key={document.document_id}
                  divider
                  dense
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
                onCreate={onCreate}
              />
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Cancel')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentLoader;
