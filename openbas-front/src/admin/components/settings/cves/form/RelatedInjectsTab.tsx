import { HubOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type CSSProperties, useState } from 'react';
import { useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { searchFindings } from '../../../../../actions/findings/finding-actions';
import { initSorting } from '../../../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../../../components/common/queryable/useQueryableWithLocalStorage';
import type { Header } from '../../../../../components/common/SortHeadersList';
import FindingIcon from '../../../../../components/FindingIcon';
import { useFormatter } from '../../../../../components/i18n';
import PaginatedListLoader from '../../../../../components/PaginatedListLoader';
import type { FindingOutput, SearchPaginationInput } from '../../../../../utils/api-types';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

interface Props {
  headers?: Header[];
  filterNames?: string[];
  contextId?: string;
}

const RelatedInjectsTab = ({ contextId, headers = [], filterNames = [] }: Props) => {
  const { classes } = useStyles();
  const { t } = useFormatter();
  const bodyItemsStyles = useBodyItemsStyles();
  const [loading, setLoading] = useState<boolean>(true);

  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  const [findings, setFindings] = useState<FindingOutput[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<FindingOutput | null>(null);

  const {
    queryableHelpers,
    searchPaginationInput,
  } = useQueryableWithLocalStorage(`finding-detail`, buildSearchPagination({
    sorts: initSorting('finding_created_at', 'DESC'),
    textSearch: search,
  }));
  //`finding-detail-${selectedFinding.finding_type}-${selectedFinding.finding_value}`

  const searchFindingsToload = (input: SearchPaginationInput) => {
    setLoading(true);
    return searchFindings(input).finally(() => {
      setLoading(false);
    });
  };

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
        availableFilterNames={filterNames}
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
            <ListItemButton
              classes={{ root: classes.item }}
              onClick={() => setSelectedFinding(finding)}
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
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default RelatedInjectsTab;
