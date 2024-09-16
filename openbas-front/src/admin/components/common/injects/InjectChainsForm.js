import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Accordion, AccordionDetails, AccordionSummary, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { Add, DeleteOutlined, ExpandMore } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  container: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  importerStyle: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
  },
}));

const InjectForm = ({
  values,
  form,
  injects,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [parents, setParents] = useState(
    injects.filter((currentInject) => currentInject.inject_id === values.inject_depends_on)
      .map((inject, index) => {
        return { inject, index };
      }),
  );
  const [childrens, setChildrens] = useState(
    injects.filter((currentInject) => currentInject.inject_depends_on === values.inject_id)
      .map((inject, index) => {
        return { inject, index };
      }),
  );

  const handleChangeParent = (_event, parent) => {
    const rx = /\.\$select-parent-(.*)-inject-(.*)/g;
    const arr = rx.exec(parent.key);

    const newParents = parents
      .map((element) => {
        if (element.index === parseInt(arr[1], 10)) {
          return {
            inject: injects.find((currentInject) => currentInject.inject_id === arr[2]),
            index: element.index,
          };
        }
        return element;
      });

    setParents(newParents);

    // We take any parent that is not undefined or undefined (since there is only one parent for now, this'll
    // be changed when we allow for multiple parents)
    const anyParent = newParents.find((inject) => inject !== undefined);

    form.mutators.setValue(
      'inject_depends_on',
      anyParent?.inject.inject_id || null,
    );
  };

  const addParent = () => {
    setParents([...parents, { inject: undefined, index: parents.length }]);
  };

  const handleChangeChildren = (_event, child) => {
    const rx = /\.\$select-children-(.*)-inject-(.*)/g;
    const arr = rx.exec(child.key);

    const newChildrens = childrens
      .map((element) => {
        if (element.index === parseInt(arr[1], 10)) {
          return {
            inject: injects.find((currentInject) => currentInject.inject_id === arr[2]),
            index: element.index,
          };
        }
        return element;
      });

    setChildrens(newChildrens);

    form.mutators.setValue('inject_depends_to', newChildrens.map((inject) => inject.inject?.inject_id));
  };

  const addChildren = () => {
    setChildrens([...childrens, { inject: undefined, index: childrens.length }]);
  };

  const deleteParent = (parent) => {
    const parentIndexInArray = parents.findIndex((currentParent) => currentParent.index === parent.index);

    if (parentIndexInArray > -1) {
      const newParents = [
        ...parents.slice(0, parentIndexInArray),
        ...parents.slice(parentIndexInArray + 1),
      ];
      setParents(newParents);
      const anyParent = newParents.find((inject) => inject !== undefined);

      form.mutators.setValue(
        'inject_depends_on',
        anyParent?.inject.inject_id || null,
      );
    }
  };

  const deleteChildren = (children) => {
    const childrenIndexInArray = childrens.findIndex((currentChildren) => currentChildren.index === children.index);

    if (childrenIndexInArray > -1) {
      const newChildrens = [
        ...childrens.slice(0, childrenIndexInArray),
        ...childrens.slice(childrenIndexInArray + 1),
      ];
      setChildrens(newChildrens);

      form.mutators.setValue('inject_depends_to', newChildrens.map((inject) => inject.inject?.inject_id));
    }
  };

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
          onClick={addParent}
        >
          <Add fontSize="small"/>
        </IconButton>
      </div>

      {parents.map((parent, index) => {
        return (
          <Accordion
            key={`accordion-parent-${parent.index}`}
            variant="outlined"
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore/>}
            >
              <div className={classes.container}>
                <Typography>
                  #{index + 1} {parent.inject?.inject_title}
                </Typography>
                <Tooltip title={t('Delete')}>
                  <IconButton color="error"
                    onClick={() => { deleteParent(parent); }}
                  >
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
                  value={parents[parent.index].inject ? parents[parent.index].inject.inject_id : ''}
                  onChange={handleChangeParent}
                >
                  {injects
                    .filter((currentInject) => currentInject.inject_depends_duration < values.inject_depends_duration
                      && (parents.find((parentSearch) => currentInject.inject_id === parentSearch.inject?.inject_id) === undefined
                        || parents[parent.index].inject?.inject_id === currentInject.inject_id))
                    .map((currentInject) => {
                      return (<MenuItem key={`select-parent-${index}-inject-${currentInject.inject_id}`}
                        value={currentInject.inject_id}
                              >{currentInject.inject_title}</MenuItem>);
                    })}
                </Select>
              </FormControl>
              <FormControl style={{ width: '100%', marginTop: '15px' }}>
                <InputLabel id="condition">{t('Condition')}</InputLabel>
                <Select
                  labelId="condition"
                  value={'Success'}
                  fullWidth={true}
                  disabled
                >
                  <MenuItem value="Success">{t('Execution successful')}</MenuItem>
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
          onClick={addChildren}
        >
          <Add fontSize="small"/>
        </IconButton>
      </div>
      {childrens.map((children, index) => {
        return (
          <Accordion
            key={`accordion-children-${children.index}`}
            variant="outlined"
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore/>}
            >
              <div className={classes.container}>
                <Typography>
                  #{index + 1} {children.inject?.inject_title}
                </Typography>
                <Tooltip title={t('Delete')}>
                  <IconButton color="error"
                    onClick={() => { deleteChildren(children); }}
                  >
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
                  value={childrens.find((childrenSearch) => children.index === childrenSearch.index).inject
                    ? childrens.find((childrenSearch) => children.index === childrenSearch.index).inject.inject_id : ''}
                  onChange={handleChangeChildren}
                >
                  {injects
                    .filter((currentInject) => currentInject.inject_depends_duration > values.inject_depends_duration
                        && (childrens.find((childrenSearch) => currentInject.inject_id === childrenSearch.inject?.inject_id) === undefined
                            || childrens.find((childrenSearch) => children.index === childrenSearch.index).inject?.inject_id === currentInject.inject_id))
                    .map((currentInject) => {
                      return (
                        <MenuItem key={`select-children-${children.index}-inject-${currentInject.inject_id}`}
                          value={currentInject.inject_id}
                        >{currentInject.inject_title}</MenuItem>);
                    })}
                </Select>
              </FormControl>
              <FormControl style={{ width: '100%', marginTop: '15px' }}>
                <InputLabel id="condition">{t('Condition')}</InputLabel>
                <Select
                  labelId="condition"
                  value={'Success'}
                  fullWidth={true}
                  disabled
                >
                  <MenuItem value="Success">{t('Execution successful')}</MenuItem>
                </Select>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
};

export default InjectForm;
