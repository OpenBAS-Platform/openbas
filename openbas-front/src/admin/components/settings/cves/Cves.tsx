import { HubOutlined, ReportProblemOutlined } from '@mui/icons-material';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { type CSSProperties, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { searchCves } from '../../../../actions/cve-actions';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import SortHeadersComponentV2 from '../../../../components/common/queryable/sort/SortHeadersComponentV2';
import useBodyItemsStyles from '../../../../components/common/queryable/style/style';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import { type Header } from '../../../../components/common/SortHeadersList';
import CVSSBadge from '../../../../components/CvssBadge';
import { useFormatter } from '../../../../components/i18n';
import PaginatedListLoader from '../../../../components/PaginatedListLoader';
import { type CveSimple, type SearchPaginationInput } from '../../../../utils/api-types';
import TaxonomiesMenu from '../TaxonomiesMenu';
import CreateCve from './CreateCve';
import CvePopover from './CvePopover';

const useStyles = makeStyles()({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
});

const inlineStyles: Record<string, CSSProperties> = ({
  cve_cve_id: { width: '20%' },
  cve_cvss: { width: '20%' },
  cve_published: { width: '60%' },
});

const Cves = () => {
  const { fldt, t } = useFormatter();
  const { classes } = useStyles();
  const bodyItemsStyles = useBodyItemsStyles();
  const [loading, setLoading] = useState<boolean>(true);

  // Filter
  const availableFilterNames = [
    'cve_cve_id',
  ];
  const [cves, setCves] = useState<CveSimple[]>([]);
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('cve', buildSearchPagination({
    sorts: initSorting('cve_created_at', 'DESC'),
    textSearch: search,
  }));

  const searchCvesToload = (input: SearchPaginationInput) => {
    setLoading(true);
    return searchCves(input).finally(() => {
      setLoading(false);
    });
  };

  const headers: Header[] = useMemo(() => [
    {
      field: 'cve_cve_id',
      label: 'CVE ID',
      isSortable: true,
      value: (cve: CveSimple) => cve.cve_cve_id,
    },
    {
      field: 'cve_cvss',
      label: 'CVSS',
      isSortable: true,
      value: (cve: CveSimple) => (
        <CVSSBadge score={cve.cve_cvss}></CVSSBadge>
      ),
    },
    {
      field: 'cve_published',
      label: 'NVD Published Date',
      isSortable: true,
      value: (cve: CveSimple) => fldt(cve.cve_published),
    },
  ], []);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flexGrow: 1 }}>
        <Breadcrumbs
          variant="list"
          elements={[{ label: t('Settings') }, { label: t('Taxonomies') }, {
            label: t('CVEs'),
            current: true,
          }]}
        />
        <PaginationComponentV2
          fetch={searchCvesToload}
          searchPaginationInput={searchPaginationInput}
          setContent={setCves}
          availableFilterNames={availableFilterNames}
          queryableHelpers={queryableHelpers}
          entityPrefix="cve"
        />
        <List>
          <ListItem
            classes={{ root: classes.itemHead }}
            style={{ paddingTop: 0 }}
            secondaryAction={<>&nbsp;</>}
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

          {loading ? <PaginatedListLoader Icon={HubOutlined} headers={headers} headerStyles={inlineStyles} /> : cves.map(cve => (
            <ListItem
              key={cve.cve_cve_id}
              classes={{ root: classes.item }}
              divider
              secondaryAction={(
                <CvePopover
                  cve={cve}
                  onUpdate={(result: CveSimple) => setCves(cves.map(a => (a.cve_cve_id !== result.cve_cve_id ? a : result)))}
                  onDelete={(result: string) => setCves(cves.filter(a => (a.cve_cve_id !== result)))}
                />
              )}
            >
              <ListItemIcon>
                <ReportProblemOutlined />
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
                        {header.value && header.value(cve)}
                      </div>
                    ))}
                  </div>
                )}
              />
            </ListItem>
          ))}
        </List>
        <CreateCve
          onCreate={(result: CveSimple) => setCves([result, ...cves])}
        />
      </div>
      <TaxonomiesMenu />
    </div>
  );
};

export default Cves;
