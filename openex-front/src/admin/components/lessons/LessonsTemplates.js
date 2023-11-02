import React from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useDispatch } from 'react-redux';
import { SchoolOutlined, ChevronRightOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import SearchFilter from '../../../components/SearchFilter';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import CreateLessonsTemplate from './CreateLessonsTemplate';
import { fetchLessonsTemplates } from '../../../actions/Lessons';

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
  lessons_template_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  lessons_template_description: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  lessons_template_name: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lessons_template_description: {
    float: 'left',
    width: '50%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const LessonsTemplates = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { userAdmin } = useHelper((helper) => {
    return {
      userAdmin: helper.getMe()?.user_admin ?? false,
    };
  });
  // Filter and sort hook
  const searchColumns = ['name', 'description'];
  const filtering = useSearchAnFilter(
    'lessons_template',
    'name',
    searchColumns,
  );
  // Fetching data
  const { lessonsTemplates } = useHelper((helper) => ({
    lessonsTemplates: helper.getLessonsTemplates(),
  }));
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
  });
  const sortedLessonsTemplates = filtering.filterAndSort(lessonsTemplates);
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
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{ padding: '0 8px 0 8px', fontWeight: 700, fontSize: 12 }}
            >
              &nbsp;
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div>
                {filtering.buildHeader(
                  'lessons_template_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'lessons_template_description',
                  'Description',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
        </ListItem>
        {sortedLessonsTemplates.map((lessonsTemplate) => {
          return (
            <ListItem
              key={lessonsTemplate.lessonstemplate_id}
              classes={{ root: classes.item }}
              divider={true}
              button={true}
              component={Link}
              to={`/admin/lessons/${lessonsTemplate.lessonstemplate_id}`}
            >
              <ListItemIcon>
                <SchoolOutlined color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.lessons_template_name}
                    >
                      {lessonsTemplate.lessons_template_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.lessons_template_description}
                    >
                      {lessonsTemplate.lessons_template_description}
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <ChevronRightOutlined />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      {
        userAdmin && <CreateLessonsTemplate />
      }
    </div>
  );
};

export default LessonsTemplates;
