import { HubOutlined } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import { type CSSProperties, useState } from 'react';
import { useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { searchDistinctFindings } from '../../../actions/findings/finding-actions';
import Drawer from '../../../components/common/Drawer';
import { initSorting, type Page } from '../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../components/common/queryable/useQueryableWithLocalStorage';
import { type Header } from '../../../components/common/SortHeadersList';
import CvssChip from '../../../components/CvssChip';
import FindingIcon from '../../../components/FindingIcon';
import ItemTags from '../../../components/ItemTags';
import ItemTargets from '../../../components/ItemTargets';
import PaginatedListLoader from '../../../components/PaginatedListLoader';
import { type FindingOutput, type SearchPaginationInput, type TargetSimple } from '../../../utils/api-types';
import FindingDetail from './FindingDetail';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

interface Props {
  searchFindings: (input: SearchPaginationInput) => Promise<{ data: Page<FindingOutput> }>;
  searchDistinctFindings: (input: SearchPaginationInput) => Promise<{ data: Page<FindingOutput> }>;
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
    'finding_type',
    'finding_tags',
    'finding_created_at',
    'finding_asset_groups',
    'finding_assets',
  ];

  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [cvssScore, setCvssScore] = useState<number | null>(null);
  const [findings, setFindings] = useState<FindingOutput[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<FindingOutput | null>(null);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage(filterLocalStorageKey, buildSearchPagination({
    sorts: initSorting('finding_created_at', 'DESC'),
    textSearch: search,
  }));

  const searchFindingsToload = (input: SearchPaginationInput) => {
    setLoading(true);
    return searchDistinctFindings(input).finally(() => {
      setLoading(false);
    });
  };

  const headers = [
    {
      field: 'finding_type',
      label: 'Type',
      isSortable: true,
      value: (finding: FindingOutput) => finding.finding_type,
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
  ];

  const basis = `${90 / (headers.length - 1)}%`;
  const inlineStyles: Record<string, CSSProperties> = ({
    finding_type: { width: '10%' },
    finding_name: { width: basis },
    finding_value: { width: basis },
    finding_assets: { width: basis },
    finding_tags: { width: basis },
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
            disablePadding
          >
            <ListItemButton
              classes={{ root: classes.item }}
              onClick={() => setSelectedFinding(finding)}
            >
              <ListItemIcon>
                <FindingIcon findingType={finding.finding_type} tooltip />
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
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {selectedFinding?.finding_value && (
        <Drawer
          open={selectedFinding !== null}
          handleClose={() => setSelectedFinding(null)}
          title={
            selectedFinding && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 0.15fr',
                  width: '100%',
                }}
              >
                <Typography variant="subtitle1">{selectedFinding.finding_value}</Typography>
                {selectedFinding.finding_type === 'cve' && (
                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                  }}
                  >
                    <Typography variant="subtitle1">CVSS</Typography>
                    {cvssScore && <CvssChip score={cvssScore} />}
                  </Box>
                )}
              </Box>
            )
          }
        >
          {selectedFinding && (
            <>
              <FindingDetail
                selectedFinding={selectedFinding}
                searchFindings={searchFindings}
                contextId={contextId}
                additionalHeaders={additionalHeaders}
                additionalFilterNames={additionalFilterNames}
                onCvssScore={score => setCvssScore(score)}
              />
            </>
          )}
        </Drawer>
      )}
    </>
  );
};

export default FindingList;
