import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import { Chip, Grid, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
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
import { searchContracts } from '../../../actions/Inject';
import PaginationComponent from '../../../components/common/pagination/PaginationComponent';
import { initSorting } from '../../../components/common/pagination/Page';

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
}));

const iconField = (type) => {
  switch (type) {
    case 'text':
      return <TitleOutlined color="primary" />;
    case 'textarea':
      return <TextFieldsOutlined color="primary" />;
    case 'checkbox':
      return <ToggleOnOutlined color="primary" />;
    case 'tuple':
      return <SplitscreenOutlined color="primary" />;
    case 'attachment':
      return <DescriptionOutlined color="primary" />;
    case 'team':
      return <CastForEducationOutlined color="primary" />;
    case 'select':
    case 'dependency-select':
      return <ListOutlined color="primary" />;
    default:
      return <HelpOutlined color="primary" />;
  }
};

const Integrations = () => {
  const classes = useStyles();
  const { t, tPick } = useFormatter();

  const [contracts, setContracts] = useState([]);

  const renderedContracts = R.values(contracts).map((type) => ({
    tname: tPick(type.label),
    ttype: tPick(type.config.label),
    ...type,
  }));
  const [searchPaginationInput, _setSearchPaginationInput] = useState({
    sorts: initSorting('config'),
  });

  return (
    <div className={classes.root}>
      <PaginationComponent
        fetch={searchContracts}
        searchPaginationInput={searchPaginationInput}
        setContent={setContracts}
      />
      <div className="clearfix" />
      <Grid container={true} spacing={3}>
        {renderedContracts.map((type) => (
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
                    <ListItemText primary={t(field.label)} />
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
