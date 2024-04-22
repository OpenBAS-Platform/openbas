import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { LabelOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import { searchTags } from '../../../../actions/Tag';
import CreateTag from './CreateTag';
import TagPopover from './TagPopover';
import TaxonomiesMenu from '../TaxonomiesMenu';
import { initSorting } from '../../../../components/common/pagination/Page';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import Breadcrumbs from '../../../../components/Breadcrumbs';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
  list: {
    marginTop: 10,
  },
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
    height: '100%',
    fontSize: 13,
  },
}));

const headerStyles = {
  tag_name: {
    width: '40%',
  },
  tag_color: {
    width: '20%',
  },
  tag_created_at: {
    width: '30%',
  },
};

const inlineStyles = {
  tag_name: {
    float: 'left',
    width: '40%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tag_color: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tag_created_at: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Tags = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, nsdt } = useFormatter();

  // Headers
  const headers = [
    { field: 'tag_name', label: 'Name', isSortable: true },
    { field: 'tag_color', label: 'Color', isSortable: true },
  ];

  const [tags, setTags] = useState([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState({
    sorts: initSorting('tag_name'),
  });

  // Export
  const exportProps = {
    exportType: 'tags',
    exportKeys: [
      'tag_name',
      'tag_color',
    ],
    exportData: tags,
    exportFileName: `${t('Tags')}.csv`,
  };

  return (
    <div className={classes.container}>
      <Breadcrumbs variant="list" elements={[{ label: t('Settings') }, { label: t('Taxonomies') }, { label: t('Tags'), current: true }]} />
      <TaxonomiesMenu />
      <PaginationComponent
        fetch={searchTags}
        searchPaginationInput={searchPaginationInput}
        setContent={setTags}
        exportProps={exportProps}
      />
      <div className="clearfix" />
      <List classes={{ root: classes.list }}>
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
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={headerStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
                }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {tags.map((tag) => (
          <ListItem
            key={tag.tag_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon style={{ color: tag.tag_color }}>
              <LabelOutlined />
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.tag_name}
                  >
                    {tag.tag_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.tag_color}
                  >
                    {tag.tag_color}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.tag_created_at}
                  >
                    {nsdt(tag.tag_created_at)}
                  </div>
                </>
                    }
            />
            <ListItemSecondaryAction>
              <TagPopover tag={tag} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateTag />
    </div>
  );
};

export default Tags;
