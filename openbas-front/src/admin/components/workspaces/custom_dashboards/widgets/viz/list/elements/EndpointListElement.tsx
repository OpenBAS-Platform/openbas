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

const useStyles = makeStyles()(() => ({
    itemHead: { textTransform: 'uppercase' },
    item: { height: 50 },
}));

type Props = {
  columns: string[];
  element: EsEndpoint;
};

export const inlineStyles: Record<string, CSSProperties> = {
    endpoint_name: { width: '25%' },
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
    base_tags_side: { width: '25%' },
    base_entity: { display: "none" },
    base_id: { display: "none" },
    base_representative: { display: "none" },
    base_restrictions: { display: "none" },
    base_dependencies: { display: "none" },
    endpoint_ips: { display: "none" },
    endpoint_mac_addresses: { display: "none" },
    base_created_at: { display: "none" },
    base_updated_at: { display: "none" },
    endpoint_description: { display: "none" },
    endpoint_external_reference: { display: "none" },
    endpoint_hostname: { display: "none" },
    endpoint_seen_ip: { display: "none" },
    base_findings_side: { display: "none" },
};

const EndpointListElement = (props: Props) => {
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  const elementsFromColumn = (column: string) => {
    switch (column) {
        case 'endpoint_name':
        case EndpointListItemFragments.ASSET_NAME:  return (endpoint: EsEndpoint) => <AssetNameFragment endpoint={endpoint} />;
        case 'endpoint_platform':
        case EndpointListItemFragments.ASSET_PLATFORM:  return (endpoint: EsEndpoint) => <AssetPlatformFragment endpoint={endpoint} />;
        case EndpointListItemFragments.ENDPOINT_ARCH:  return (endpoint: EsEndpoint) => <EndpointArchFragment endpoint={endpoint} />;
        case 'base_tags_side':
        case EndpointListItemFragments.ASSET_TAGS:  return (endpoint: EsEndpoint) => <AssetTagsFragment endpoint={endpoint} />;
        default: return (endpoint: EsEndpoint) => {
            let key = column as keyof typeof endpoint;
            return endpoint[key];
        };
    }
  }

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
                      {props.columns.map(col => (
                          <div
                              key={col}
                              style={{
                                  ...bodyItemsStyles.bodyItem,
                                  ...inlineStyles[col],
                              }}
                          >
                              {elementsFromColumn(col)(props.element)}
                          </div>
                      ))}
                  </div>
              )}
          />
      </ListItemButton>
    </>
  );
};

export default EndpointListElement;
