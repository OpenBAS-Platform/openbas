import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ComputerOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import Transition from '../../../../components/common/Transition';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import ItemTags from '../../../../components/ItemTags';
import EndpointCreation from './EndpointCreation';
import type { EndpointStore } from './Endpoint';
import { truncate } from '../../../../utils/String';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { EndpointsHelper } from '../../../../actions/assets/asset-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchEndpoints } from '../../../../actions/assets/endpoint-actions';
import useSearchAnFilter from '../../../../utils/SortingFiltering';

const useStyles = makeStyles(() => ({
  box: {
    width: '100%',
    minHeight: '100%',
    padding: 20,
    border: '1px dashed rgba(255, 255, 255, 0.3)',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
}));

interface Props {
  initialState: string[]
  open: boolean;
  onClose: () => void;
  onSubmit: (endpointIds: string[]) => void;
  title: string;
}

const EndpointsDialogAdding: FunctionComponent<Props> = ({
  initialState = [],
  open,
  onClose,
  onSubmit,
  title,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Filter and sort hook
  const filtering = useSearchAnFilter('asset', 'name', ['name']);

  // Fetching data
  const { endpointsMap } = useHelper((helper: EndpointsHelper) => ({
    endpointsMap: helper.getEndpointsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchEndpoints());
  });

  const sortedEndpoints: EndpointStore[] = filtering.filterAndSort(R.values(endpointsMap));

  const [endpointIds, setEndpointIds] = useState<string[]>(initialState);
  useEffect(() => {
    setEndpointIds(initialState);
  }, [open, initialState]);

  const addEndpoint = (endpointId: string) => {
    setEndpointIds([...endpointIds, endpointId]);
  };
  const removeEndpoint = (endpointId: string) => {
    setEndpointIds(endpointIds.filter((id) => id !== endpointId));
  };

  // Dialog
  const handleClose = () => {
    setEndpointIds([]);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(endpointIds);
    handleClose();
  };

  return (
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
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} style={{ marginTop: -15 }}>
          <Grid item xs={8}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <SearchFilter
                  fullWidth
                  onChange={filtering.handleSearch}
                  keyword={filtering.keyword}
                />
              </Grid>
              <Grid item xs={6}>
                <TagsFilter
                  fullWidth
                  onAddTag={filtering.handleAddTag}
                  onRemoveTag={filtering.handleRemoveTag}
                  currentTags={filtering.tags}
                />
              </Grid>
            </Grid>
            <List>
              {sortedEndpoints.map((endpoint) => {
                const disabled = endpointIds.includes(endpoint.asset_id);
                return (
                  <ListItemButton
                    key={endpoint.asset_id}
                    disabled={disabled}
                    divider
                    dense
                    onClick={() => addEndpoint(endpoint.asset_id)}
                  >
                    <ListItemIcon>
                      <ComputerOutlined color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={endpoint.asset_name}
                      secondary={endpoint.asset_description}
                    />
                    <ItemTags variant="list" tags={endpoint.asset_tags} />
                  </ListItemButton>
                );
              })}
              <EndpointCreation
                inline
                onCreate={(result) => addEndpoint(result)}
              />
            </List>
          </Grid>
          <Grid item xs={4}>
            <Box className={classes.box}>
              {endpointIds.map((endpointId) => {
                const endpoint: EndpointStore = endpointsMap[endpointId];
                return (
                  <Chip
                    key={endpointId}
                    onDelete={() => removeEndpoint(endpointId)}
                    label={truncate(endpoint?.asset_name, 22)}
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
        <Button color="secondary" onClick={handleSubmit}>
          {t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EndpointsDialogAdding;
