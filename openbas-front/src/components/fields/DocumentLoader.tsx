import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { AttachmentOutlined, ControlPointOutlined, DescriptionOutlined } from '@mui/icons-material';
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
import DocumentType from '../../admin/components/components/documents/DocumentType';
import ButtonPopover, { ButtonPopoverEntry } from '../common/ButtonPopover';

const useStyles = makeStyles((theme: Theme) => ({
  bodyItem: {
    height: '100%',
    fontSize: 13,
  },
  item: {
    paddingLeft: 10,
    height: 50,
    cursor: 'pointer',
    margin: 0,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const inlineStyles = {
  document_name: {
    float: 'left',
    width: '35%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_type: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

interface Props {
  initialValue?: { id: string, label: string };
  extensions?: string[];
  label: string;
  name: string;
  setFieldValue: (field: string, value: any) => void;
}

const DocumentLoader: React.FC<Props> = ({ initialValue, extensions = [], label, name, setFieldValue }) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetching data
  const { documents, userAdmin }: { documents: [Document], userAdmin: string } = useHelper((helper: DocumentHelper & UserHelper) => ({
    documents: helper.getDocuments(),
    userAdmin: helper.getMe()?.user_admin,
  }));
  const dispatch = useAppDispatch();
  useDataLoader(() => {
    dispatch(fetchDocuments());
  });

  useEffect(() => {
    if (initialValue?.id && documents.length > 0) {
      const resolvedDocument = documents.find((doc) => doc.document_id === initialValue.id);
      if (resolvedDocument) {
        setSelectedDocument(resolvedDocument);
      }
    }
  }, [initialValue, documents]);

  useEffect(() => {
    if (selectedDocument) {
      setFieldValue(name, { id: selectedDocument.document_id, label: selectedDocument.document_name });
    }
  }, [selectedDocument, setFieldValue]);

  const filterByKeyword = (n: Document) => keyword === ''
      || R.anyPass([
        R.pipe(R.propOr('', 'document_name'), R.toLower, R.includes(R.toLower(keyword))),
        R.pipe(R.propOr('', 'document_description'), R.toLower, R.includes(R.toLower(keyword))),
        R.pipe(R.propOr('', 'document_type'), R.toLower, R.includes(R.toLower(keyword))),
      ])(n);

  const filterByExtensions = (n: Document) => extensions.length === 0
      || R.contains(R.pipe(R.split('.'), R.last, R.toLower)(n.document_name), extensions.map(R.toLower));

  const filteredDocuments = R.pipe(
    R.filter(R.allPass([
      (n: Document) => tags.length === 0 || R.any((tag: any) => R.contains(tag, n.document_tags || []), tags),
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

  // Action handlers
  const handleUpdate = () => setOpen(true);
  const handleRemove = () => setSelectedDocument(null);
  const handleDownload = (documentId: string | undefined) => {
    if (documentId) {
      window.location.href = `/api/documents/${documentId}/file`;
    }
  };

  // Button Popover entries
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleUpdate },
    { label: 'Remove', action: handleRemove },
    { label: 'Download', action: () => handleDownload(selectedDocument?.document_id) },
  ];

  return (
    <>
      <Typography variant="h4" style={{ marginTop: 20, marginBottom: 0, textTransform: 'none' }}>
        {label}
      </Typography>
      <List style={{ marginTop: 0, paddingTop: 0 }}>
        {!selectedDocument && (
          <ListItem
            classes={{ root: classes.item }}
            divider
            onClick={() => setOpen(true)}
            color="primary"
          >
            <ListItemIcon color="primary">
              <ControlPointOutlined color="primary"/>
            </ListItemIcon>
            <ListItemText
              primary={`${t('Add')} ${label}`}
              classes={{ primary: classes.text }}
            />
          </ListItem>)}
        {selectedDocument && (
          <ListItem
            classes={{ root: classes.item }}
            key={selectedDocument.document_id}
            divider
            onClick={() => setOpen(true)}
          >
            <ListItemIcon>
              <AttachmentOutlined/>
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  <div className={classes.bodyItem} style={inlineStyles.document_name}>
                    {selectedDocument.document_name}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.document_type}>
                    <DocumentType type={selectedDocument.document_type} variant="list"/>
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.document_tags}>
                    <ItemTags
                      variant="list"
                      tags={selectedDocument.document_tags}
                    />
                  </div>
                </>
                    }
            />
            <ListItemSecondaryAction>
              <ButtonPopover
                entries={entries}
                buttonProps={{
                  color: 'primary',
                  size: 'large',
                  borderRadius: '50%',
                  border: 'none',
                  padding: '12px',
                }}
              />
            </ListItemSecondaryAction>
          </ListItem>)}
      </List>
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
