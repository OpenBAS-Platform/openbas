import { MoreVert } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as R from 'ramda';
import { useState } from 'react';

import { deleteDocument, updateDocument } from '../../../../actions/Document';
import { fetchExercises } from '../../../../actions/Exercise';
import { fetchScenarios } from '../../../../actions/scenarios/scenario-actions';
import DialogDelete from '../../../../components/common/DialogDelete.js';
import Drawer from '../../../../components/common/Drawer';
import Transition from '../../../../components/common/Transition';
import ContextLink from '../../../../components/ContextLink.js';
import { useFormatter } from '../../../../components/i18n';
import { ATOMIC_BASE_URL, CHALLENGE_BASE_URL, CHANNEL_BASE_URL, PAYLOAD_BASE_URL, SCENARIO_BASE_URL, SECURITY_PLATFORM_BASE_URL, SIMULATION_BASE_URL } from '../../../../constants/BaseUrls.js';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { exerciseOptions, scenarioOptions, tagOptions } from '../../../../utils/Option';
import DocumentForm from './DocumentForm';

const entityPaths = {
  atomicTestings: item => `${ATOMIC_BASE_URL}/${item.id}`,
  simulations: item => `${SIMULATION_BASE_URL}/${item.id}`,
  scenarioInjects: item => `${SCENARIO_BASE_URL}/${item.context}/injects`,
  simulationInjects: item => `${SIMULATION_BASE_URL}/${item.context}/injects`,
  scenarioArticles: item => `${SCENARIO_BASE_URL}/${item.context}/definition`,
  simulationArticles: item => `${SIMULATION_BASE_URL}/${item.context}/definition`,
  payloads: () => PAYLOAD_BASE_URL,
  channels: () => CHANNEL_BASE_URL,
  challenges: () => CHALLENGE_BASE_URL,
  securityPlatforms: () => SECURITY_PLATFORM_BASE_URL,
};

// Ordered entity types
const renderOrder = [
  'atomicTestings',
  'scenarioInjects',
  'simulationInjects',
  'simulations',
  'payloads',
  'channels',
  'scenarioArticles',
  'simulationArticles',
  'challenges',
  'securityPlatforms',
];

const DocumentPopover = (props) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { document, disabled, onRemoveDocument, attached, onToggleAttach, inline, onUpdate, onDelete } = props;

  // Fetching data
  const { tagsMap, exercisesMap, scenariosMap } = useHelper(helper => ({
    tagsMap: helper.getTagsMap(),
    exercisesMap: helper.getExercisesMap(),
    scenariosMap: helper.getScenariosMap(),
  }));
  if (!props.scenariosAndExercisesFetched) {
    useDataLoader(() => {
      dispatch(fetchExercises());
      dispatch(fetchScenarios());
    });
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [relations, setRelations] = useState(null);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);

  const handlePopoverOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
  };

  const onSubmitEdit = (data) => {
    const inputValues = R.pipe(
      R.assoc('document_tags', R.pluck('id', data.document_tags)),
      R.assoc('document_exercises', R.pluck('id', data.document_exercises)),
      R.assoc('document_scenarios', R.pluck('id', data.document_scenarios)),
    )(data);
    return dispatch(updateDocument(document.document_id, inputValues))
      .then((result) => {
        if (onUpdate) {
          const updated = result.entities.documents[result.result];
          onUpdate(updated);
        }
        handleCloseEdit();
      });
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
    setLoadingRelations(true);
    fetch(`/api/documents/${document.document_id}/relations`)
      .then(res => res.json())
      .then((data) => {
        setRelations(data);
      })
      .catch(() => {
        setRelations(null);
      })
      .finally(() => {
        setLoadingRelations(false);
      });
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const submitDelete = () => {
    dispatch(deleteDocument(document.document_id)).then(
      () => {
        if (onDelete) {
          onDelete(document.document_id);
        }
      },
    );
    handleCloseDelete();
  };

  const buildEntityPath = (type, item) => {
    const pathFn = entityPaths[type];
    if (!pathFn) return '#';
    return pathFn.length > 0 ? pathFn(item) : pathFn();
  };

  const renderRelations = (entities) => {
    return renderOrder.map((type) => {
      const items = entities[type];
      if (!items?.length) return null;

      return (
        <div key={type}>
          <Typography variant={"body2"} gutterBottom>
            {t(type)}
            :
          </Typography>
          <ul style={{
            margin: 0,
            padding: theme.spacing(0,2,1),
          }}
          >
            {items.map(item => (
              <li key={item.id}>
                <ContextLink
                  title={item.name}
                  url={buildEntityPath(type, item)}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  const handleOpenRemove = () => {
    setOpenRemove(true);
    handlePopoverClose();
  };

  const handleCloseRemove = () => {
    setOpenRemove(false);
  };

  const submitRemove = () => {
    onRemoveDocument(document.document_id);
    handleCloseRemove();
  };

  const handleToggleAttachement = () => {
    onToggleAttach(document.document_id);
    handlePopoverClose();
  };

  const documentTags = tagOptions(document.document_tags, tagsMap);
  const documentExercises = exerciseOptions(
    document.document_exercises,
    exercisesMap,
  );
  const documentScenarios = scenarioOptions(
    document.document_scenarios,
    scenariosMap,
  );
  const initialValues = R.pipe(
    R.assoc('document_tags', documentTags),
    R.assoc('document_exercises', documentExercises),
    R.assoc('document_scenarios', documentScenarios),
    R.pick([
      'document_name',
      'document_description',
      'document_type',
      'document_tags',
      'document_exercises',
      'document_scenarios',
    ]),
  )(document);
  return (
    <div>
      <IconButton
        color="primary"
        onClick={handlePopoverOpen}
        aria-haspopup="true"
        size="large"
        disabled={disabled}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        {onUpdate && (
          <MenuItem onClick={handleOpenEdit}>
            {t('Update')}
          </MenuItem>
        )}
        {onToggleAttach && (
          <MenuItem onClick={handleToggleAttachement}>
            {attached ? t('Disable attachment') : t('Enable attachment')}
          </MenuItem>
        )}
        {onRemoveDocument && (
          <MenuItem onClick={handleOpenRemove}>
            {t('Remove from the element')}
          </MenuItem>
        )}
        {!onRemoveDocument && (
          <MenuItem onClick={handleOpenDelete} disabled={!document.document_can_be_deleted}>
            {t('Delete')}
          </MenuItem>
        )}
      </Menu>

      <DialogDelete
        open={openDelete}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={loadingRelations ? (
          <div>
            {t('Loading relations...')}
          </div>
        ) : relations
          ? (
              <>
                {Object.values(relations).some(list => list.length > 0) && (
                  <>
                    <Typography gutterBottom>
                      {t('The document is used in the following entities:')}
                    </Typography>
                    {renderRelations(relations)}
                  </>
                )}
                <Typography sx={{ paddingTop: theme.spacing(2) }}>
                  {t('Do you want to delete this document?')}
                </Typography>
              </>
            )
          : t('Unable to load relations.')}
      />

      {inline ? (
        <Dialog
          open={openEdit}
          handleClose={handleCloseEdit}
          title={t('Update the document')}
        >
          <DocumentForm
            initialValues={initialValues}
            editing
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
          />
        </Dialog>
      ) : (
        <Drawer
          open={openEdit}
          handleClose={handleCloseEdit}
          title={t('Update the document')}
        >
          <DocumentForm
            initialValues={initialValues}
            editing
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
          />
        </Drawer>
      )}

      <Dialog
        open={openRemove}
        TransitionComponent={Transition}
        onClose={handleCloseRemove}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to remove the document from the element?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemove}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitRemove}>
            {t('Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentPopover;
