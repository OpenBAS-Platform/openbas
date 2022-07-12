import React from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useDispatch } from 'react-redux';
import { PermMediaOutlined } from '@mui/icons-material';
import SearchFilter from '../../../components/SearchFilter';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { fetchMedias } from '../../../actions/Media';
import MediaPopover from './MediaPopover';
import CreateMedia from './CreateMedia';

const useStyles = makeStyles((theme) => ({
  parameters: {
    marginTop: -10,
  },
  container: {
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
  itemIcon: {
    color: theme.palette.primary.main,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  inputLabel: {
    float: 'left',
  },
  sortIcon: {
    float: 'left',
    margin: '-5px 0 0 15px',
  },
  icon: {
    color: theme.palette.primary.main,
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  media_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  media_color: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  media_name: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  media_color: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Medias = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  // Filter and sort hook
  const searchColumns = ['name'];
  const filtering = useSearchAnFilter('media', 'name', searchColumns);
  // Fetching data
  const { medias } = useHelper((helper) => ({
    medias: helper.getMedias(),
  }));
  useDataLoader(() => {
    dispatch(fetchMedias());
  });
  const sortedMedias = filtering.filterAndSort(medias);
  return (
      <div>
        <div className={classes.parameters}>
          <div style={{ float: 'left', marginRight: 20 }}>
            <SearchFilter
                small={true}
                onChange={filtering.handleSearch}
                keyword={filtering.keyword}
            />
          </div>
        </div>
        <div className="clearfix" />
        <List classes={{ root: classes.container }}>
          <ListItem classes={{ root: classes.itemHead }} divider={false} style={{ paddingTop: 0 }}>
            <ListItemIcon>
            <span style={{ padding: '0 8px 0 8px', fontWeight: 700, fontSize: 12 }}>
              &nbsp;
            </span>
            </ListItemIcon>
            <ListItemText
                primary={
                  <div>
                    {filtering.buildHeader(
                      'media_name',
                      'Name',
                      true,
                      headerStyles,
                    )}
                    {filtering.buildHeader(
                      'media_color',
                      'Color',
                      true,
                      headerStyles,
                    )}
                  </div>
                }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedMedias.map((media) => (
              <ListItem key={media.media_id} classes={{ root: classes.item }} divider={true}>
                <ListItemIcon>
                  <PermMediaOutlined color="primary" />
                </ListItemIcon>
                <ListItemText
                    primary={
                      <div>
                        <div className={classes.bodyItem} style={inlineStyles.media_name}>
                          {media.media_name}
                        </div>
                        <div className={classes.bodyItem} style={inlineStyles.media_color}>
                          {media.media_color}
                        </div>
                      </div>
                    }
                />
                <ListItemSecondaryAction>
                  <MediaPopover media={media} />
                </ListItemSecondaryAction>
              </ListItem>
          ))}
        </List>
        <CreateMedia />
      </div>
  );
};

export default Medias;
