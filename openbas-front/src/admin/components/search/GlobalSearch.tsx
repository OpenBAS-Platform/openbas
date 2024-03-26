import React, { CSSProperties, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { KeyboardArrowRight } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import globalSearch from '../../../actions/globalSearch-action';
import type { GlobalSearchResult } from '../../../utils/api-types';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';
import useEntityIcon from '../../../utils/hooks/useEntityIcon';
import useEntityLink from './useEntityLink';
import EntityType from './EntityType';

const useStyles = makeStyles(() => ({
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
}));

const inlineStyles: Record<string, CSSProperties> = {
  result_entity: {
    width: '25%',
  },
  result_name: {
    width: '25%',
  },
};

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  result_entity: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  result_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const GlobalSearch = () => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  const [results, setResults] = useState<GlobalSearchResult[]>([]);

  useEffect(() => {
    globalSearch(search).then((result: { data: GlobalSearchResult[] }) => {
      setResults(result.data);
    });
  }, [search]);

  // Headers
  const fields = [
    { name: 'result_entity', label: 'Type', isSortable: false, value: (result: GlobalSearchResult) => <EntityType entityType={result.entity} /> },
    { name: 'result_name', label: 'Name', isSortable: false, value: (result: GlobalSearchResult) => result.name },
  ];

  // Fixme: use pagination field

  return (
    <>
      <Breadcrumbs variant="object" elements={[
        { label: t('Search'), current: true },
      ]}
      />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{
                padding: '0 8px 0 8px',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
                &nbsp;
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                {fields.map((header) => (
                  <div key={header.name}>
                    <div style={inlineStylesHeaders[header.name]}>
                      <span>{t(header.label)}</span>
                    </div>
                  </div>
                ))
                }
              </>
            }
          />
        </ListItem>
        {results.map((result) => (
          <ListItemButton
            key={result.id}
            classes={{ root: classes.item }}
            divider
            component={Link}
            to={useEntityLink(result.entity, result.id, search)}
          >
            <ListItemIcon>
              {useEntityIcon(result.entity)}
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className={classes.bodyItem}
                      style={inlineStyles[field.name]}
                    >
                      {field.value(result)}
                    </div>
                  ))}
                </>
              }
            />
            <ListItemIcon classes={{ root: classes.goIcon }}>
              <KeyboardArrowRight />
            </ListItemIcon>
          </ListItemButton>
        ))}
      </List>
    </>
  );
};

export default GlobalSearch;
