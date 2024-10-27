import { FunctionComponent, useContext, useState } from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../i18n';
import { fetchDocuments } from '../../actions/Document';
import useDataLoader from '../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../utils/hooks';
import type { Theme } from '../Theme';
import { PermissionsContext } from '../../admin/components/common/Context';
import FileTransferDialog from './FileTransferDialog';
import type { RawDocument } from '../../utils/api-types';

const useStyles = makeStyles((theme: Theme) => ({
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
  hasAttachments?: boolean;
  handleAddDocuments: (documents: { document_id: string, document_attached: boolean }[]) => void;
  initialDocumentIds: string[];
}

const MultipleFileLoader: FunctionComponent<Props> = ({
  hasAttachments = false,
  handleAddDocuments,
  initialDocumentIds,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);

  useDataLoader(() => {
    dispatch(fetchDocuments());
  });

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  const submitAddDocuments = (documents: RawDocument[]) => {
    handleAddDocuments(documents.filter((doc) => doc.document_id !== undefined)
      .map((document: RawDocument) => ({
        document_id: document.document_id!,
        document_attached: hasAttachments,
      })));
  };

  return (
    <>
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
      <FileTransferDialog
        label={t('Add documents')}
        open={open}
        setOpen={setOpen}
        multiple
        initialDocumentIds={initialDocumentIds}
        onSubmitAddDocuments={submitAddDocuments}
      >
      </FileTransferDialog>
    </>
  );
};

export default MultipleFileLoader;
