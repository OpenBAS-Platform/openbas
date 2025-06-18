import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {CSSProperties} from '@mui/material/styles';
import {makeStyles} from 'tss-react/mui';

import {type EsEndpoint} from '../../../../../../../../utils/api-types';
import {EndpointListItemFragments} from "../../../../../../common/endpoints/EndpointListItemFragments";
import {Link} from "react-router";
import { DevicesOtherOutlined } from '@mui/icons-material';
import useBodyItemsStyles from "../../../../../../../../components/common/queryable/style/style";
import AssetNameFragment from "../../../../../../common/endpoints/fragments/elastic/AssetNameFragment";
import AssetPlatformFragment from "../../../../../../common/endpoints/fragments/elastic/AssetPlatformFragment";
import AssetTagsFragment from "../../../../../../common/endpoints/fragments/elastic/AssetTagsFragment";
import EndpointArchFragment from "../../../../../../common/endpoints/fragments/elastic/EndpointArchFragment";
type Props = {
  columns: string[];
  element: EsEndpoint;
};

export const inlineStyles: Record<string, CSSProperties> = {
    asset_name: { width: '25%' },
    endpoint_active: { width: '10%' },
    endpoint_agents_privilege: { width: '12%' },
    asset_platform: {
        width: '10%',
        display: 'flex',
        alignItems: 'center',
    },
    endpoint_arch: { width: '10%' },
    endpoint_agents_executor: {
        width: '13%',
        display: 'flex',
        alignItems: 'center',
    },
    asset_tags: { width: '15%' },
};

const EndpointElement = (props: Props) => {
  const useStyles = makeStyles()(() => ({
    item: { height: 50 },
    bodyItem: {
      fontSize: 13,
      float: 'left',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    typeChip: {
      height: 20,
      borderRadius: 4,
      textTransform: 'uppercase',
      width: 100,
      marginBottom: 5,
    },
  }));
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  const headers = [
    {
      field: EndpointListItemFragments.ASSET_NAME,
      label: 'Name',
      isSortable: true,
      value: (endpoint: EsEndpoint) => <AssetNameFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ASSET_PLATFORM,
      label: 'Platform',
      isSortable: true,
      value: (endpoint: EsEndpoint) => <AssetPlatformFragment endpoint={endpoint} />,
    },
      {
          field: EndpointListItemFragments.ENDPOINT_ARCH,
          label: 'Architecture',
          isSortable: true,
          value: (endpoint: EsEndpoint) => <EndpointArchFragment endpoint={endpoint} />,
      },
    {
      field: EndpointListItemFragments.ASSET_TAGS,
      label: 'Tags',
      isSortable: false,
      value: (endpoint: EsEndpoint) => <AssetTagsFragment endpoint={endpoint} />,
    },
  ];

  return (
    <>
      <ListItemButton component={Link}
                      to={`/admin/assets/endpoints/${props.element.base_id}`}
                      classes={{ root: classes.item }} className="noDrag">
          <ListItemIcon>
              <DevicesOtherOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
              primary={(
                  <div style={bodyItemsStyles.bodyItems}>
                      {headers.map(header => (
                          <div
                              key={header.field}
                              style={{
                                  ...bodyItemsStyles.bodyItem,
                                  ...inlineStyles[header.field],
                              }}
                          >
                              {header.value(props.element)}
                          </div>
                      ))}
                  </div>
              )}
          />
      </ListItemButton>
    </>
  );
};

export default EndpointElement;
