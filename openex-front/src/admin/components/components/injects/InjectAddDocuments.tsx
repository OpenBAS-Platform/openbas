import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined, DescriptionOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../../../components/SearchFilter';
import { useFormatter } from '../../../../components/i18n';
import { fetchDocuments } from '../../../../actions/Document';
import CreateDocument from '../documents/CreateDocument';
import { truncate } from '../../../../utils/String';
import Transition from '../../../../components/common/Transition';
import TagsFilter from '../../../../components/TagsFilter';
import ItemTags from '../../../../components/ItemTags';
import type { Option } from '../../../../utils/Option';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import type { Theme } from '../../../../components/Theme';
import { useHelper } from '../../../../store';
import type { DocumentsHelper, UsersHelper } from '../../../../actions/helper';
import { PermissionsContext } from '../Context';
import type { Document } from '../../../../utils/api-types';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

interface Props {
  hasAttachments: boolean;
  handleAddDocuments: (documents: { document_id: string, document_attached: boolean }[]) => void;
  injectDocumentsIds: string[];
}

const InjectAddDocuments: FunctionComponent<Props> = ({
  hasAttachments,
  handleAddDocuments,
  injectDocumentsIds,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);

  const { documents, userAdmin } = useHelper((helper: DocumentsHelper & UsersHelper) => ({
    documents: helper.getDocumentsMap(),
    userAdmin: helper.getMe()?.user_admin,
  }));

  useDataLoader(() => {
    dispatch(fetchDocuments());
  });

  const [open, setopen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [documentsIds, setDocumentsIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Option[]>([]);

  const handleOpen = () => setopen(true);

  const handleClose = () => {
    setopen(false);
    setKeyword('');
    setDocumentsIds([]);
  };

  const handleSearchDocuments = (value: string) => {
    setKeyword(value);
  };

  const handleAddTag = (value: Option) => {
    if (value) {
      setTags([value]);
    }
  };

  const handleClearTag = () => setTags([]);

  const addDocument = (documentId: string) => setDocumentsIds(R.append(documentId, documentsIds));

  const removeDocument = (documentId: string) => setDocumentsIds(documentsIds.filter((u) => u !== documentId));

  const submitAddDocuments = () => {
    handleAddDocuments(documentsIds.map((n: string) => ({
      document_id: n,
      document_attached: hasAttachments,
    })));
    handleClose();
  };

  const onCreate = (result: string) => {
    addDocument(result);
  };

  const filterByKeyword = (n: Document) => keyword === ''
    || (n.document_name || '').toLowerCase().indexOf(keyword.toLowerCase())
    !== -1
    || (n.document_description || '')
      .toLowerCase()
      .indexOf(keyword.toLowerCase()) !== -1
    || (n.document_type || '').toLowerCase().indexOf(keyword.toLowerCase())
    !== -1;
  const filteredDocuments = R.pipe(
    R.filter(
      (n: Document) => tags.length === 0
        || R.any(
          (filter: string) => R.includes(filter, n.document_tags),
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
        button
        divider
        onClick={handleOpen}
        color="primary"
        disabled={permissions.readOnly}
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
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
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
        <DialogTitle>{t('Add documents in this inject')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: -15 }}>
            <Grid item xs={8}>
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
                  const disabled = documentsIds.includes(document.document_id)
                    || injectDocumentsIds.includes(document.document_id);
                  return (
                    <ListItem
                      key={document.document_id}
                      disabled={disabled}
                      button
                      divider
                      dense
                      onClick={() => addDocument(document.document_id)}
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
                    inline
                    onCreate={onCreate}
                  />
                )}
              </List>
            </Grid>
            <Grid item xs={4}>
              <Box className={classes.box}>
                {documentsIds.map((documentId) => {
                  const document = documents[documentId];
                  return (
                    <Chip
                      key={documentId}
                      onDelete={() => removeDocument(documentId)}
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
          <Button onClick={handleClose}>{t('Cancel')}</Button>
          <Button
            color="secondary"
            onClick={submitAddDocuments}
          >
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InjectAddDocuments;
