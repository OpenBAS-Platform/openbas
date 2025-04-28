import { HubOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { type CSSProperties, useState } from 'react';
import { useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { initSorting, type Page } from '../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../components/common/queryable/useQueryableWithLocalStorage';
import { type Header } from '../../../components/common/SortHeadersList';
import FindingIcon from '../../../components/FindingIcon';
import ItemTags from '../../../components/ItemTags';
import ItemTargets from '../../../components/ItemTargets';
import PaginatedListLoader from '../../../components/PaginatedListLoader';
import { type FindingOutput, type SearchPaginationInput, type TargetSimple } from '../../../utils/api-types';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

interface Props {
  searchFindings: (input: SearchPaginationInput) => Promise<{ data: Page<FindingOutput> }>;
  additionalHeaders?: Header[];
  additionalFilterNames?: string[];
  filterLocalStorageKey: string;
  contextId?: string;
}

const FindingList = ({ searchFindings, filterLocalStorageKey, contextId, additionalHeaders = [], additionalFilterNames = [] }: Props) => {
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();
  const [loading, setLoading] = useState<boolean>(true);

  const availableFilterNames = [
    'finding_name',
    'finding_type',
    'finding_tags',
    'finding_created_at',
    'finding_asset_groups',
    'finding_assets',
    ...additionalFilterNames,
  ];

  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  const [findings, setFindings] = useState<FindingOutput[]>([]);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage(filterLocalStorageKey, buildSearchPagination({
    sorts: initSorting('finding_created_at', 'DESC'),
    textSearch: search,
  }));

  const searchFindingsToload = (input: SearchPaginationInput) => {
    setLoading(true);
    return searchFindings(input).finally(() => {
      setLoading(false);
    });
  };

  const headers = [
    {
      field: 'finding_type',
      label: 'Type',
      isSortable: true,
      value: (finding: FindingOutput) => finding.finding_type,
    }, {
      field: 'finding_name',
      label: 'Name',
      isSortable: true,
      value: (finding: FindingOutput) => <Tooltip title={finding.finding_name}><span>{finding.finding_name}</span></Tooltip>,
    },
    {
      field: 'finding_value',
      label: 'Value',
      isSortable: true,
      value: (finding: FindingOutput) => <Tooltip title={finding.finding_value}><span>{finding.finding_value}</span></Tooltip>,
    },
    {
      field: 'finding_tags',
      label: 'Tags',
      isSortable: false,
      value: (finding: FindingOutput) => <ItemTags variant="list" tags={finding.finding_tags} />,
    },
    {
      field: 'finding_assets',
      label: 'Endpoints',
      isSortable: false,
      value: (finding: FindingOutput) => (
        <ItemTargets targets={(finding.finding_assets || []).map(asset => ({
          target_id: asset.asset_id,
          target_name: asset.asset_name,
          target_type: 'ASSETS',
        })) as TargetSimple[]}
        />
      ),
    },
    ...additionalHeaders,
  ];

  const basis = `${90 / (headers.length - 1)}%`;
  const inlineStyles: Record<string, CSSProperties> = ({
    finding_type: { width: '10%' },
    finding_name: { width: basis },
    finding_value: { width: basis },
    finding_assets: { width: basis },
    finding_tags: { width: basis },
    ...additionalHeaders.reduce((acc, header) => {
      acc[header.field] = { width: basis };
      return acc;
    }, {} as Record<string, CSSProperties>),
  });

  return (
    <>
      <PaginationComponentV2
        fetch={searchFindingsToload}
        searchPaginationInput={searchPaginationInput}
        setContent={setFindings}
        entityPrefix="finding"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
        contextId={contextId}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon />
          <ListItemText
            primary={(
              <SortHeadersComponentV2
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                sortHelpers={queryableHelpers.sortHelpers}
              />
            )}
          />
        </ListItem>
        {loading ? <PaginatedListLoader Icon={HubOutlined} headers={headers} headerStyles={inlineStyles} /> : findings.map(finding => (
          <ListItem
            key={finding.finding_id}
            classes={{ root: classes.item }}
            divider
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
    </>
  );
};

export default FindingList;
