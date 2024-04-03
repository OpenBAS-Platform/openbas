import React, { FunctionComponent } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import R from 'ramda';
import TagField from '../../../../components/field/TagField';
import EndpointsList from '../../assets/endpoints/EndpointsList';
import EndpointPopover from '../../assets/endpoints/EndpointPopover';
import InjectAddEndpoints from '../../exercises/injects/endpoints/InjectAddEndpoints';
import AssetGroupsList from '../../assets/asset_groups/AssetGroupsList';
import AssetGroupPopover from '../../assets/asset_groups/AssetGroupPopover';
import InjectAddAssetGroups from '../../exercises/injects/assetgroups/InjectAddAssetGroups';

interface Props {

}

const CreationInjectType: FunctionComponent<Props> = () => {
  return (
    <form id="scenarioForm">
      <h3>Test name</h3>
      <TextField
        variant="standard"
        fullWidth
        placeholder={'Test name'}
      />

      <h3>Inject details</h3>
      <TextField
        variant="standard"
        fullWidth
        multiline
        rows={3}
        InputProps={{
          readOnly: true,
        }}
      />

      <h3>Targeted assets</h3>

      <h3>Targeted asset groups</h3>

      {/* {hasAssets && (
        <>
          <Typography variant="h2" style={{ float: 'left' }}>
            {t('Targeted assets')}
          </Typography>
          <EndpointsList
            endpoints={assets}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Endpoint property handle by EndpointsList
            actions={<EndpointPopover inline onRemoveEndpointFromInject={this.handleRemoveAsset.bind(this)} />}
          />
          <InjectAddEndpoints
            endpointIds={assetIds}
            onSubmit={this.handleAddAssets.bind(this)}
            filter={(e) => Object.keys(e.asset_sources).length > 0 && injectType.context['collector-ids']?.includes(Object.keys(e.asset_sources))}
          />
        </>
      )}
      {hasAssetGroups && (
        <>
          <Typography variant="h2" style={{ float: 'left', marginTop: hasAssets ? 30 : 0 }}>
            {t('Targeted asset groups')}
          </Typography>
          <AssetGroupsList
            assetGroups={assetGroups}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Endpoint property handle by EndpointsList
            actions={<AssetGroupPopover inline onRemoveAssetGroupFromInject={this.handleRemoveAssetGroup.bind(this)} />}
          />
          <InjectAddAssetGroups assetGroupIds={assetGroupIds} onSubmit={this.handleAddAssetGroups.bind(this)} />
        </>
      )} */}
    </form>
  );
};

export default CreationInjectType;
