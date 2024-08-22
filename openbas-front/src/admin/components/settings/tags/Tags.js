import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { LabelOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import { searchTags } from '../../../../actions/Tag';
import CreateTag from './CreateTag';
import TagPopover from './TagPopover';
import TaxonomiesMenu from '../TaxonomiesMenu';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';
import Breadcrumbs from '../../../../components/Breadcrumbs';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
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
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyItem: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const inlineStyles = {
  tag_name: {
    width: '40%',
  },
  tag_color: {
    width: '20%',
  },
};

const Tags = () => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

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
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStyles}
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
            divider
          >
            <ListItemIcon style={{ color: tag.tag_color }}>
              <LabelOutlined />
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.bodyItems}>
                  <div className={classes.bodyItem} style={inlineStyles.tag_name}>
                    {tag.tag_name}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.tag_color}>
                    {tag.tag_color}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <TagPopover
                tag={tag}
                onUpdate={(result) => setTags(tags.map((existingTag) => (existingTag.tag_id !== result.tag_id ? existingTag : result)))}
                onDelete={(result) => setTags(tags.filter((existingTag) => (existingTag.tag_id !== result)))}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateTag
        onCreate={(result) => setTags([result, ...tags])}
      />
    </div>
  );
};

export default Tags;
