import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { Accordion, AccordionDetails, AccordionSummary, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { Add, DeleteOutlined, ExpandMore } from '@mui/icons-material';
import inject18n from '../../../../components/i18n';

const styles = () => ({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  red: {
    borderColor: 'rgb(244, 67, 54)',
  },
  importerStyle: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
  },
});

class InjectForm extends Component {
  render() {
    const {
      t,
      values,
      form,
      classes,
      injects,
    } = this.props;

    const handleChange = (event) => {
      form.mutators.setValue('inject_depends_to', event.target.value);
    };

    const parents = injects.filter((currentInject) => currentInject.inject_id === values.inject_depends_on);
    const childrens = injects.filter((currentInject) => currentInject.inject_depends_on === values.inject_id);

    return (
      <>
        <div className={classes.importerStyle}>
          <Typography variant="h2" sx={{ m: 0 }}>
            {t('Parent')}
          </Typography>
          <IconButton
            color="secondary"
            aria-label="Add"
            size="large"
            disabled={parents.length > 0}
          >
            <Add fontSize="small"/>
          </IconButton>
        </div>

        {parents.map((parent, index) => {
          return (
            <Accordion
              key={parent.inject_id}
              variant="outlined"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore/>}
              >
                <div className={classes.container}>
                  <Typography>
                    #{index + 1} {parent.inject_title}
                  </Typography>
                  <Tooltip title={t('Delete')}>
                    <IconButton color="error">
                      <DeleteOutlined fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="inject_id">{t('Inject')}</InputLabel>
                  <Select
                    labelId="condition"
                    fullWidth={true}
                    value={parent.inject_id}
                  >
                    {injects.map((currentInject, selectIndex) => {
                      return (<MenuItem key={`select-${index}-inject-${selectIndex}`} value={currentInject.inject_id}>{currentInject.inject_title}</MenuItem>);
                    })}
                  </Select>
                </FormControl>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="condition">{t('Condition')}</InputLabel>
                  <Select
                    labelId="condition"
                    value={'Success'}
                    fullWidth={true}
                    disabled
                  >
                    <MenuItem value="Success">{t('Success')}</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          );
        })}

        <div className={classes.importerStyle}>
          <Typography variant="h2" sx={{ m: 0 }}>
            {t('Childrens')}
          </Typography>
          <IconButton
            color="secondary"
            aria-label="Add"
            size="large"
          >
            <Add fontSize="small"/>
          </IconButton>
        </div>
        {childrens.map((parent, index) => {
          return (
            <Accordion
              key={parent.inject_id}
              variant="outlined"
              style={{ width: '100%', marginBottom: '10px' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore/>}
              >
                <div className={classes.container}>
                  <Typography>
                    #{index + 1} {parent.inject_title}
                  </Typography>
                  <Tooltip title={t('Delete')}>
                    <IconButton color="error">
                      <DeleteOutlined fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="inject_id">{t('Inject')}</InputLabel>
                  <Select
                    labelId="condition"
                    fullWidth={true}
                  >
                    {injects.map((currentInject, selectIndex) => {
                      return (<MenuItem key={`select-${index}-inject-${selectIndex}`} value={currentInject.inject_id}>{currentInject.inject_title}</MenuItem>);
                    })}
                  </Select>
                </FormControl>
                <FormControl style={{ width: '100%' }}>
                  <InputLabel id="condition">{t('Condition')}</InputLabel>
                  <Select
                    labelId="condition"
                    value={'Success'}
                    fullWidth={true}
                    disabled
                  >
                    <MenuItem value="Success">{t('Success')}</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </>
    );
  }
}

InjectForm.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  tPick: PropTypes.func,
  injects: PropTypes.object,
};

export default R.compose(inject18n, withStyles(styles))(InjectForm);
