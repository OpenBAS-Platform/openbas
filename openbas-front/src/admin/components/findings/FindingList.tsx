import { HubOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import type { CSSProperties } from 'react';
import { makeStyles } from 'tss-react/mui';

import SortHeadersComponentV2 from '../../../components/common/queryable/sort/SortHeadersComponentV2';
import type { SortHelpers } from '../../../components/common/queryable/sort/SortHelpers';
import useBodyItemsStyles from '../../../components/common/queryable/style/style';
import { type Header } from '../../../components/common/SortHeadersList';
import FindingIcon from '../../../components/FindingIcon';
import ItemTags from '../../../components/ItemTags';
import ItemTargets from '../../../components/ItemTargets';
import PaginatedListLoader from '../../../components/PaginatedListLoader';
import { type Finding, type TargetSimple } from '../../../utils/api-types';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

const inlineStyles: Record<string, CSSProperties> = {
  finding_type: { width: '20%' },
  finding_field: { width: '20%' },
  finding_value: {
    width: '30%',
    cursor: 'default',
  },
  finding_assets: { width: '10%' },
  finding_tags: { width: '20%' },
};

interface Props {
  findings: Finding[];
  sortHelpers: SortHelpers;
  assetsMap: Map<string, TargetSimple>;
  additionalHeaders?: Header[];
  loading?: boolean;
}

const FindingList = ({ findings, sortHelpers, assetsMap, additionalHeaders = [], loading = false }: Props) => {
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();

  const headers = [
    {
      field: 'finding_type',
      label: 'Type',
      isSortable: true,
      value: (finding: Finding) => finding.finding_type,
    },
    {
      field: 'finding_value',
      label: 'Value',
      isSortable: true,
      value: (finding: Finding) => finding.finding_value,
    },
    {
      field: 'finding_tags',
      label: 'Tags',
      isSortable: false,
      value: (finding: Finding) => <ItemTags variant="list" tags={finding.finding_tags} />,
    },
    {
      field: 'finding_assets',
      label: 'Asset',
      isSortable: false,
      value: (finding: Finding) => <ItemTargets targets={(finding.finding_assets || []).map(assetId => assetsMap.get(assetId) || '') as TargetSimple[]} />,
    },
    ...additionalHeaders,
  ];

  return (
    <List>
      <ListItem
        classes={{ root: classes.itemHead }}
        style={{ padding: 0 }}
      >
        <ListItemIcon />
        <ListItemText
          primary={(
            <SortHeadersComponentV2
              headers={headers}
              inlineStylesHeaders={inlineStyles}
              sortHelpers={sortHelpers}
            />
          )}
        />
      </ListItem>
      {loading ? <PaginatedListLoader Icon={HubOutlined} headers={headers} headerStyles={inlineStyles} /> : findings.map((finding: Finding) => (
        <ListItem
          key={finding.finding_id}
          classes={{ root: classes.item }}
          divider={true}
          disablePadding={true}
        >
          <ListItemIcon>
            <FindingIcon findingType={finding.finding_type} tooltip={true} />
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
                    {header.value && header.value(finding)}
                  </div>
                ))}
              </div>
            )}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default FindingList;
