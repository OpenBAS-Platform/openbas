import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type CSSProperties, type FunctionComponent, useContext, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { searchFindingsForInjects } from '../../../../actions/findings/finding-actions';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import FindingIcon from '../../../../components/FindingIcon';
import ItemTags from '../../../../components/ItemTags';
import ItemTargets from '../../../../components/ItemTargets';
import {
  type Finding,
  type InjectResultOverviewOutput, type TargetSimple,
} from '../../../../utils/api-types';
import {
  InjectResultOverviewOutputContext,
  type InjectResultOverviewOutputContextType,
} from '../InjectResultOverviewOutputContext';

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

const AtomicTestingFindings: FunctionComponent = () => {
  const { classes } = useStyles();
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };
  const bodyItemsStyles = useBodyItemsStyles();

  const availableFilterNames = ['finding_type'];
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);
  const assetsMap = new Map<string, TargetSimple>();
  injectResultOverviewOutput?.inject_targets.forEach((target) => {
    assetsMap.set(target.id, {
      target_id: target.id,
      target_name: target.name,
      target_type: target.targetType,
    } as TargetSimple);
  });

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  const [findings, setFindings] = useState<Finding[]>([]);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('finding', buildSearchPagination({
    sorts: initSorting('finding_created_at'),
    textSearch: search,
  }));

  // Headers
  const headers = [
    {
      field: 'finding_type',
      label: 'Type',
      isSortable: true,
      value: (finding: Finding) => finding.finding_type,
    },
    {
      field: 'finding_field',
      label: 'Key',
      isSortable: true,
      value: (finding: Finding) => finding.finding_field,
    },
    {
      field: 'finding_value',
      label: 'Value',
      isSortable: true,
      value: (finding: Finding) => finding.finding_value,
    },
    {
      field: 'finding_assets',
      label: 'Asset',
      isSortable: false,
      value: (finding: Finding) => <ItemTargets targets={(finding.finding_assets || []).map(assetId => assetsMap.get(assetId)) as TargetSimple[]} />,
    },
    {
      field: 'finding_tags',
      label: 'Tags',
      isSortable: false,
      value: (finding: Finding) => <ItemTags variant="list" tags={finding.finding_tags} />,
    },
  ];

  return (
    <>
      <PaginationComponentV2
        fetch={searchPaginationInput => searchFindingsForInjects(injectId, searchPaginationInput)}
        searchPaginationInput={searchPaginationInput}
        setContent={setFindings}
        entityPrefix="finding"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
      />
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
                sortHelpers={queryableHelpers.sortHelpers}
              />
            )}
          />
        </ListItem>
        {findings.map((finding: Finding) => (
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
                      {header.value(finding)}
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

export default AtomicTestingFindings;
