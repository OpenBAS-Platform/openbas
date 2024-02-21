import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import { Chip, Grid, List, ListItem, ListItemIcon, ListItemText, Pagination, Paper, Typography } from '@mui/material';
import {
  CastForEducationOutlined,
  DescriptionOutlined,
  HelpOutlined,
  ListOutlined,
  SplitscreenOutlined,
  TextFieldsOutlined,
  TitleOutlined,
  ToggleOnOutlined,
} from '@mui/icons-material';
import { useFormatter } from '../../../components/i18n';
import { fetchPageOfContracts } from '../../../actions/Inject';
import SearchFilter from '../../../components/SearchFilter';
import useSearchAnFilter from '../../../utils/SortingFiltering';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  parameters: {
    marginTop: -10,
  },
}));

const iconField = (type) => {
  switch (type) {
    case 'text':
      return <TitleOutlined color="primary"/>;
    case 'textarea':
      return <TextFieldsOutlined color="primary"/>;
    case 'checkbox':
      return <ToggleOnOutlined color="primary"/>;
    case 'tuple':
      return <SplitscreenOutlined color="primary"/>;
    case 'attachment':
      return <DescriptionOutlined color="primary"/>;
    case 'team':
      return <CastForEducationOutlined color="primary"/>;
    case 'select':
    case 'dependency-select':
      return <ListOutlined color="primary"/>;
    default:
      return <HelpOutlined color="primary"/>;
  }
};

const Integrations = () => {
  const classes = useStyles();
  const { t, tPick } = useFormatter();

  const [injectTypes, setInjectTypes] = useState([]);

  const filtering = useSearchAnFilter(null, null, [
    'ttype',
    'tname',
    'name',
    'type',
  ]);
  const types = R.sortWith(
    [R.ascend(R.prop('ttype')), R.ascend(R.prop('tname'))],
    R.values(injectTypes)
      .filter((type) => type.config.expose === true)
      .map((type) => ({
        tname: tPick(type.label),
        ttype: tPick(type.config.label),
        ...type,
      })),
  );
  const sortedTypes = filtering.filterAndSort(types);

  // Pagination
  const PAGE_SIZE = 5;
  const BACKEND_PAGE_NORMALIZER = 1;
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [page, setPage] = React.useState(1);

  useEffect(() => {
    fetchPageOfContracts(page - BACKEND_PAGE_NORMALIZER, PAGE_SIZE).then((result) => {
      const { data } = result;
      setInjectTypes(data.content);
      setNumberOfPages(Math.ceil(data.totalElements / PAGE_SIZE));
    });
  }, [page]);

  const handlePagination = (_event, value) => {
    setPage(value);
  };

  return (
    <div className={classes.root}>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'right', marginRight: 10 }}>
          <Pagination
            count={numberOfPages}
            page={page}
            onChange={handlePagination}
          />
        </div>
      </div>
      <div className="clearfix"/>
      <Grid container={true} spacing={3}>
        {sortedTypes.map((type) => (
          <Grid
            key={type.contract_id}
            item={true}
            xs={6}
            style={{ marginBottom: 30 }}
          >
            <Typography variant="h4">
              [{type.ttype}] {type.tname}
            </Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <List style={{ paddingTop: 0 }}>
                {type.fields.map((field) => (
                  <ListItem key={field.key} divider={true} dense={true}>
                    <ListItemIcon>{iconField(field.type)}</ListItemIcon>
                    <ListItemText primary={t(field.label)}/>
                    <Chip
                      size="small"
                      sx={{ height: 15, fontSize: 10 }}
                      label={field.mandatory ? t('Mandatory') : t('Optional')}
                      color={field.mandatory ? 'secondary' : 'primary'}
                      />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Integrations;
