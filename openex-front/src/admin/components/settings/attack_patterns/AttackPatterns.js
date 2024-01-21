import React from 'react';
import { useDispatch } from 'react-redux';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CheckCircleOutlined, PersonOutlined } from '@mui/icons-material';
import { fetchAttackPatterns } from '../../../../actions/AttackPattern';
import SearchFilter from '../../../../components/SearchFilter';
import CreateAttackPattern from './CreateAttackPattern';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import AttackPatternPopover from './AttackPatternPopover';
import TaxonomiesMenu from '../TaxonomiesMenu';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
  parameters: {
    float: 'left',
    marginTop: -10,
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
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  kill_chain_phase: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  attack_pattern_external_id: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  attack_pattern_name: {
    float: 'left',
    width: '35%',
    fontSize: 12,
    fontWeight: '700',
  },
  attack_pattern_created_at: {
    float: 'left',
    width: '12%',
    fontSize: 12,
    fontWeight: '700',
  },
  attack_pattern_updated_at: {
    float: 'left',
    width: '12%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  kill_chain_phase: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attack_pattern_external_id: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attack_pattern_name: {
    float: 'left',
    width: '35%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attack_pattern_created_at: {
    float: 'left',
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attack_pattern_updated_at: {
    float: 'left',
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const AttackPatterns = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const searchColumns = [
    'name',
    'description',
    'external_id',
  ];
  const filtering = useSearchAnFilter('attack_pattern', 'external_id', searchColumns);
  const { attackPatterns, tagsMap, organizationsMap } = useHelper((helper) => ({
    attackPatterns: helper.getAttackPatterns(),
  }));
  useDataLoader(() => {
    dispatch(fetchAttackPatterns());
  });
  return (
    <div className={classes.container}>
      <TaxonomiesMenu />
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
      </div>
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
              <>
                {filtering.buildHeader(
                  'kill_chain_phase',
                  'Kill chain phase',
                  false,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'attack_pattern_external_id',
                  'External ID',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'attack_pattern_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'attack_pattern_created_at',
                  'Created',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'attack_pattern_updated_at',
                  'Updated',
                  true,
                  headerStyles,
                )}
              </>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {filtering.filterAndSort(attackPatterns ?? []).map((attackPattern) => (
          <ListItem
            key={attackPattern.attackPattern_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <PersonOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.attackPattern_email}
                  >
                    {attackPattern.attackPattern_email}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.attackPattern_firstname}
                  >
                    {attackPattern.attackPattern_firstname}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.attackPattern_lastname}
                  >
                    {attackPattern.attackPattern_lastname}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.attackPattern_organization}
                  >
                    {
                      organizationsMap[attackPattern.attackPattern_organization]
                        ?.organization_name
                    }
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.attackPattern_admin}
                  >
                    {attackPattern.attackPattern_admin ? (
                      <CheckCircleOutlined fontSize="small" />
                    ) : (
                      '-'
                    )}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.attackPattern_lastname}
                  >
                    {attackPattern.attackPattern_lastname}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <AttackPatternPopover
                attackPattern={attackPattern}
                tagsMap={tagsMap}
                organizationsMap={organizationsMap}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateAttackPattern />
    </div>
  );
};

export default AttackPatterns;
