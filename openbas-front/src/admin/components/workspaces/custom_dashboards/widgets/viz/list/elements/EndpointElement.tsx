import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import {CSSProperties, useTheme} from '@mui/material/styles';
import {makeStyles} from 'tss-react/mui';

import {type EsEndpoint} from '../../../../../../../../utils/api-types';
import {EndpointListItemFragments} from "../../../../../../common/endpoints/EndpointListItemFragments";
import {useFormatter} from "../../../../../../../../components/i18n";
import {Link} from "react-router";
import { DevicesOtherOutlined } from '@mui/icons-material';
import useBodyItemsStyles from "../../../../../../../../components/common/queryable/style/style";
import AssetNameFragment from "../../../../../../common/endpoints/fragments/elastic/AssetNameFragment";
import AssetPlatformFragment from "../../../../../../common/endpoints/fragments/elastic/AssetPlatformFragment";
import AssetTagsFragment from "../../../../../../common/endpoints/fragments/elastic/AssetTagsFragment";
import AssetTypeFragment from "../../../../../../common/endpoints/fragments/elastic/AssetTypeFragment";

type Props = {
  columns: string[];
  element: EsEndpoint;
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
    const inlineStyles: Record<string, CSSProperties> = {
        asset_name: { width: '25%' },
        endpoint_active: { width: '10%' },
        endpoint_agents_privilege: { width: '12%' },
        endpoint_platform: {
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
  const { classes } = useStyles();
    const bodyItemsStyles = useBodyItemsStyles();
    const {t} = useFormatter();

    const theme = useTheme();

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
      field: EndpointListItemFragments.ASSET_TAGS,
      label: 'Tags',
      isSortable: false,
      value: (endpoint: EsEndpoint) => <AssetTagsFragment endpoint={endpoint} />,
    },
    {
      field: EndpointListItemFragments.ASSET_TYPE,
      label: 'Type',
      isSortable: false,
      value: (endpoint: EsEndpoint) => <AssetTypeFragment endpoint={endpoint} />,
    },
  ];

  return (
    <>
      <ListItemButton component={Link}
                      to={`/admin/assets/endpoints/${props.element.base_id}`}
                      classes={{ root: classes.item }}>
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
