import { FunctionComponent, useState } from 'react';
import { ListItemButton, ListItemIcon, ListItemText, Theme } from '@mui/material';
import { ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import type { EndpointInput } from '../../../../utils/api-types';
import EndpointForm from './EndpointForm';
import { addEndpoint } from '../../../../actions/assets/endpoint-actions';
import Drawer from '../../../../components/common/Drawer';
import Dialog from '../../../../components/common/Dialog';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import type { EndpointStore } from './Endpoint';

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.h2.fontWeight,
  },
}));

interface Props {
  inline?: boolean;
  onCreate?: (result: EndpointStore) => void;
}

const EndpointCreation: FunctionComponent<Props> = ({
  inline,
  onCreate,
}) => {
  // Standard hooks
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { t } = useFormatter();

  const dispatch = useAppDispatch();
  const onSubmit = (data: EndpointInput) => {
    dispatch(addEndpoint(data)).then(
      (result: { result: string, entities: { endpoints: Record<string, EndpointStore> } }) => {
        if (result.entities) {
          if (onCreate) {
            const endpointCreated = result.entities.endpoints[result.result];
            onCreate(endpointCreated);
          }
          setOpen(false);
        }
        return result;
      },
    );
  };

  return (
    <>
      {inline ? (
        <ListItemButton
          divider
          onClick={() => setOpen(true)}
          color="primary"
        >
          <ListItemIcon color="primary">
            <ControlPointOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('Create a new endpoint')}
            classes={{ primary: classes.text }}
          />
        </ListItemButton>
      ) : (
        <ButtonCreate onClick={() => setOpen(true)} />
      )}

      {inline ? (
        <Dialog
          open={open}
          handleClose={() => setOpen(false)}
          title={t('Create a new endpoint')}
        >
          <EndpointForm
            onSubmit={onSubmit}
            handleClose={() => setOpen(false)}
          />
        </Dialog>
      ) : (
        <Drawer
          open={open}
          handleClose={() => setOpen(false)}
          title={t('Create a new endpoint')}
        >
          <EndpointForm
            onSubmit={onSubmit}
            handleClose={() => setOpen(false)}
          />
        </Drawer>
      )}
    </>
  );
};

export default EndpointCreation;
