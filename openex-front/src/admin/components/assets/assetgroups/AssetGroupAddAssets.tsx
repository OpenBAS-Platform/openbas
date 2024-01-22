import React, { FunctionComponent, useState } from 'react';
import { PersonOutlined } from '@mui/icons-material';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { EndpointsHelper } from '../../../../actions/assets/asset-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchEndpoints } from '../../../../actions/assets/endpoint-actions';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import { updateAssetsOnAssetGroup } from '../../../../actions/assetgroups/assetgroup-action';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import { truncate } from '../../../../utils/String';
import ItemTags from '../../../../components/ItemTags';
import { Option } from '../../../../utils/Option';
import type { EndpointStore } from '../endpoints/Endpoint';
import EndpointCreation from '../endpoints/EndpointCreation';
import ButtonCreate from '../../../../components/common/ButtonCreate';

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
  assetGroupId: string;
  assetGroupAssetIds: string[];
}

const AssetGroupAddAssets: FunctionComponent<Props> = ({
  assetGroupId,
  assetGroupAssetIds,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Fetching data
  const { endpointsMap } = useHelper((helper: EndpointsHelper) => ({
    endpointsMap: helper.getEndpointsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchEndpoints());
  });

  const endpoints: [EndpointStore] = R.values(endpointsMap);

  const [endpointIds, setEndpointIds] = useState<string[]>([]);

  const addEndpoint = (endpointId: string) => {
    setEndpointIds([...endpointIds, endpointId]);
  };
  const removeEndpoint = (endpointId: string) => {
    setEndpointIds(endpointIds.filter((id) => id !== endpointId));
  };

  // Filter
  const [keyword, setKeyword] = useState('');
  const handleSearch = (value: string) => {
    setKeyword(value);
  };

  const [tags, setTags] = useState<Option[]>([]);
  const handleAddTag = (value: Option) => {
    if (value) {
      setTags(R.uniq(R.append(value, tags)));
    }
  };
  const handleRemoveTag = (value: string) => {
    setTags(tags.filter((n) => n.id !== value));
  };

  // Dialog
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setKeyword('');
    setEndpointIds([]);
  };

  const onSubmit = () => {
    dispatch(updateAssetsOnAssetGroup(assetGroupId, {
      asset_group_assets: R.uniq([...assetGroupAssetIds, ...endpointIds]),
    })).then(() => handleClose());
  };

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
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
        <DialogTitle>{t('Add assets in this asset group')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} style={{ marginTop: -15 }}>
            <Grid item xs={8}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <SearchFilter
                    fullWidth
                    onChange={handleSearch}
                    keyword={keyword}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TagsFilter
                    fullWidth
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    currentTags={tags}
                  />
                </Grid>
              </Grid>
              <List>
                {endpoints.map((endpoint) => {
                  const disabled = endpointIds.includes(endpoint.asset_id)
                    || assetGroupAssetIds.includes(endpoint.asset_id);
                  return (
                    <ListItemButton
                      key={endpoint.asset_id}
                      disabled={disabled}
                      divider
                      dense
                      onClick={() => addEndpoint(endpoint.asset_id)}
                    >
                      <ListItemIcon>
                        <PersonOutlined />
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
                      label={truncate(endpoint.asset_name, 22)}
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
          <Button color="secondary" onClick={onSubmit}>
            {t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetGroupAddAssets;
