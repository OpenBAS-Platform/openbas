import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Tooltip,
} from '@mui/material';
import { DevicesOtherOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import Transition from '../../../../components/common/Transition';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../common/filters/TagsFilter';
import ItemTags from '../../../../components/ItemTags';
import type { EndpointStore } from './Endpoint';
import { truncate } from '../../../../utils/String';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { EndpointHelper } from '../../../../actions/assets/asset-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchEndpoints } from '../../../../actions/assets/endpoint-actions';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import PlatformIcon from '../../../../components/PlatformIcon';

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
  bodyItem: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

interface Props {
  initialState: string[];
  open: boolean;
  onClose: () => void;
  onSubmit: (endpointIds: string[]) => void;
  title: string;
  filter?: (endpoint: EndpointStore) => boolean;
  platforms?: string[];
}

const EndpointsDialogAdding: FunctionComponent<Props> = ({
  initialState = [],
  open,
  onClose,
  onSubmit,
  title,
  filter,
  platforms,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Filter and sort hook
  const filtering = useSearchAnFilter('asset', 'name', ['name']);

  // Fetching data
  const { endpointsMap } = useHelper((helper: EndpointHelper) => ({
    endpointsMap: helper.getEndpointsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchEndpoints());
  });

  const [disableFilter, setDisableFilter] = useState(false);

  const sortedEndpoints: EndpointStore[] = filtering.filterAndSort(R.values(endpointsMap)
    .filter((!disableFilter && !!filter) ? filter : () => true))
    .filter((endpoint: EndpointStore) => {
      if (platforms && platforms.length > 0) {
        return platforms.includes(endpoint.endpoint_platform);
      }
      return true;
    });

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
              <Grid item xs={4}>
                <SearchFilter
                  fullWidth
                  onChange={filtering.handleSearch}
                  keyword={filtering.keyword}
                />
              </Grid>
              <Grid item xs={4}>
                <TagsFilter
                  fullWidth
                  onAddTag={filtering.handleAddTag}
                  onRemoveTag={filtering.handleRemoveTag}
                  currentTags={filtering.tags}
                />
              </Grid>
              {!!filter
                && <Grid item xs={4}>
                  <Tooltip title={t('By default, only assets compliant with the injector are displayed')}>
                    <FormControlLabel
                      control={<Switch checked={disableFilter} onChange={(_e, checked) => setDisableFilter(checked)} />}
                      label={t('Show all assets')}
                    />
                  </Tooltip>
                </Grid>
              }
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
                      <DevicesOtherOutlined color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className={classes.bodyItem} style={{ width: '45%' }}>
                            {endpoint.asset_name}
                          </div>
                          <div className={classes.bodyItem} style={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                            <PlatformIcon platform={endpoint.endpoint_platform} width={20} marginRight={10} /> {endpoint.endpoint_platform}
                          </div>
                          <div className={classes.bodyItem} style={{ width: '35%' }}>
                            <ItemTags variant="reduced-view" tags={endpoint.asset_tags} />
                          </div>
                        </div>
                      }
                    />
                  </ListItemButton>
                );
              })}
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
