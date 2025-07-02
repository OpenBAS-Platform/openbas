import { DevicesOtherOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import AssetPlatformFragment from '../../../../../../../../../components/common/list/fragments/AssetPlatformFragment';
import AssetTagsFragment from '../../../../../../../../../components/common/list/fragments/AssetTagsFragment';
import EndpointArchFragment from '../../../../../../../../../components/common/list/fragments/EndpointArchFragment';
import InverseBooleanFragment from '../../../../../../../../../components/common/list/fragments/InverseBooleanFragment';
import useBodyItemsStyles from '../../../../../../../../../components/common/queryable/style/style';
import { ENDPOINT_BASE_URL } from '../../../../../../../../../constants/BaseUrls';
import { type EsEndpoint } from '../../../../../../../../../utils/api-types';
import EndpointListItemFragments from '../../../../../../../common/endpoints/EndpointListItemFragments';
import buildStyles from '../ColumnStyles';
import EndpointElementStyles from './EndpointElementStyles';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

type Props = {
  columns: string[];
  element: EsEndpoint;
};

const EndpointListElement = (props: Props) => {
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  const endpointUrl = `${ENDPOINT_BASE_URL}/${props.element.base_id}`;

  /* eslint-disable react/display-name */
  // eslint doesn't seem to be able to infer the display names of subcomponents but react can
  const elementsFromColumn = (column: string) => {
    switch (column) {
      case EndpointListItemFragments.ENDPOINT_PLATFORM:
        return (endpoint: EsEndpoint) => <AssetPlatformFragment platform={endpoint.endpoint_platform} />;
      case EndpointListItemFragments.ENDPOINT_ARCH:
        return (endpoint: EsEndpoint) => <EndpointArchFragment arch={endpoint.endpoint_arch} />;
      case EndpointListItemFragments.BASE_TAGS_SIDE:
        return (endpoint: EsEndpoint) => <AssetTagsFragment tags={endpoint.base_tags_side ?? []} />;
      case EndpointListItemFragments.ENDPOINT_IS_EOL:
        return (endpoint: EsEndpoint) => <InverseBooleanFragment bool={endpoint.endpoint_is_eol} />;
      default: return (endpoint: EsEndpoint) => {
        const key = column as keyof typeof endpoint;
        return endpoint[key]?.toString();
      };
    }
  };
  /* eslint-enable react/display-name */

  return (
    <ListItemButton
      component={Link}
      to={endpointUrl}
      classes={{ root: classes.item }}
      className="noDrag"
    >
      <ListItemIcon>
        <DevicesOtherOutlined color="primary" />
      </ListItemIcon>
      <ListItemText
        primary={(
          <div style={bodyItemsStyles.bodyItems}>
            {props.columns.map(col => (
              <div
                key={col}
                style={{
                  ...bodyItemsStyles.bodyItem,
                  ...buildStyles(props.columns, EndpointElementStyles)[col],
                }}
              >
                {elementsFromColumn(col)(props.element)}
              </div>
            ))}
          </div>
        )}
      />
    </ListItemButton>
  );
};

export default EndpointListElement;
