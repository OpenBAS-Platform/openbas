import { Clear } from '@mui/icons-material';
import { Button, Divider, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { generateScenarioFromSTIXBundle } from '../../../../../actions/scenarios/scenario-actions';
import Dialog from '../../../../../components/common/Dialog';
import ImportUploader from '../../../../../components/common/ImportUploader';
import { useFormatter } from '../../../../../components/i18n';
import type { Scenario } from '../../../../../utils/api-types';

const useStyles = makeStyles()(theme => ({
  textLabel: { alignSelf: 'end' },
  filesLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
  },
  allWidth: { gridColumn: 'span 2' },
  fileListContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  loaderContainer: {
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  loaderText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  onAttackPatternIdsFind: (ids: string[]) => void;
}

const ImportSTIXBundleDialog = ({ open, onClose, onAttackPatternIdsFind }: Props) => {
  const { t } = useFormatter();
  const { classes } = useStyles();
  const maxFilesNumber = 1;
  // State hooks
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const onResetAndClose = () => {
    setFiles([]);
    onClose();
  };

  const onSubmit = () => {
    setIsLoading(true);
    generateScenarioFromSTIXBundle(scenarioId, files ?? [])
      .then(response => onAttackPatternIdsFind(response.data))
      .finally(() => {
        setIsLoading(false);
        onResetAndClose();
      });
  };

  const addFile = (_: FormData, file: File) => {
    if (!files.find(f => f.name === file.name)) {
      setFiles(prevState => [...prevState ?? [], file]);
    }
  };

  return (
    <Dialog
      open={open}
      handleClose={onResetAndClose}
      title={t('Extaction TTPs from STIX Bundle')}
      maxWidth="md"
    >
      <>
        <div>
          <span className={classes.filesLabel}>
            <Typography variant="h3" gutterBottom>{t('Import STIX Bundle (.json)')}</Typography>
            <ImportUploader
              title="Import files"
              handleUpload={addFile}
              isIconButton={false}
              fileAccepted=".json"
              disabled={files.length >= maxFilesNumber}
              allowReUpload
            />
          </span>
          <span className={classes.fileListContainer}>
            <List>
              {files.map(file => (
                <span key={file.name}>
                  <ListItem
                    dense
                    secondaryAction={(
                      <IconButton
                        size="small"
                        aria-label="remove-file"
                        onClick={() => setFiles(files.filter(f => f.name !== file.name))}
                      >
                        <Clear />
                      </IconButton>
                    )}
                  >
                    <ListItemText primary={file.name} />
                  </ListItem>
                  <Divider />
                </span>
              ))}
            </List>
          </span>
        </div>
        <div className={`${classes.buttonContainer} ${classes.allWidth}`}>
          <Button
            variant="contained"
            style={{ marginLeft: 'auto' }}
            onClick={onResetAndClose}
            disabled={isLoading}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onSubmit}
            disabled={isLoading || (files.length === 0)}
          >
            {t('Extract')}
          </Button>
        </div>
      </>
    </Dialog>
  );
};

export default ImportSTIXBundleDialog;
