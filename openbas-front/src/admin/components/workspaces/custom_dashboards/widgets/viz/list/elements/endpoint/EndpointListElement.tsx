import { DevicesOtherOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import useBodyItemsStyles from '../../../../../../../../../components/common/queryable/style/style';
import { type EsEndpoint } from '../../../../../../../../../utils/api-types';
import EndpointListItemFragments from '../../../../../../../common/endpoints/EndpointListItemFragments';
import AssetPlatformFragment from '../../../../../../../common/endpoints/fragments/elastic/AssetPlatformFragment';
import AssetTagsFragment from '../../../../../../../common/endpoints/fragments/elastic/AssetTagsFragment';
import EndpointArchFragment from '../../../../../../../common/endpoints/fragments/elastic/EndpointArchFragment';
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

  const endpointUrl = `/admin/assets/endpoints/${props.element.base_id}`;

  /* eslint-disable react/display-name */
  // eslint doesn't seem to be able to infer the display names of subcomponents but react can
  const elementsFromColumn = (column: string) => {
    switch (column) {
      case EndpointListItemFragments.ENDPOINT_PLATFORM: return (endpoint: EsEndpoint) => <AssetPlatformFragment endpoint={endpoint} />;
      case EndpointListItemFragments.ENDPOINT_ARCH: return (endpoint: EsEndpoint) => <EndpointArchFragment endpoint={endpoint} />;
      case EndpointListItemFragments.BASE_TAGS_SIDE: return (endpoint: EsEndpoint) => <AssetTagsFragment endpoint={endpoint} />;
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
