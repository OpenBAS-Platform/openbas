import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { Add, DeleteOutlined, ExpandMore } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import ClickableModeChip from '../../../../components/common/chips/ClickableModeChip';
import ClickableChip from '../../../../components/common/chips/ClickableChip';

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
  labelExecutionCondition: {
    color: '#7c8088',
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
    injects.filter((currentInject) => values.inject_depends_on !== null
        && values.inject_depends_on[currentInject.inject_id] !== undefined)
      .map((inject, index) => {
        return { inject, index };
      }),
  );
  const [childrens, setChildrens] = useState(
    injects.filter((currentInject) => currentInject.inject_depends_on !== null
        && currentInject.inject_depends_on[values.inject_id] !== undefined)
      .map((inject, index) => {
        return { inject, index };
      }),
  );

  const getConditionContentParent = (injectDependsOn) => {
    const breakpointAndOr = /&&|\|\|/gm;
    const breakpointValue = /==/gm;
    const typeFromName = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.*)-Success/mg;
    const conditions = [];
    for (const dependency in injectDependsOn) {
      if (Object.hasOwn(injectDependsOn, dependency)) {
        const condition = injectDependsOn[dependency];
        const splittedConditions = condition.split(breakpointAndOr);
        conditions.push({
          parentId: dependency,
          mode: condition.includes('||') ? 'or' : 'and',
          conditionElement: splittedConditions.map((splitedCondition, index) => {
            const key = Array.from(splitedCondition.split(breakpointValue)[0].trim().matchAll(typeFromName), (m) => m[1]);
            return {
              name: splitedCondition.split(breakpointValue)[0].trim(),
              value: splitedCondition.split(breakpointValue)[1].trim(),
              key: key[0],
              index,
            };
          }),
        });
      }
    }
    return conditions;
  };

  const getConditionContentChildren = (injectDependsTo) => {
    const breakpointAndOr = /&&|\|\|/gm;
    const breakpointValue = /==/gm;
    const typeFromName = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.*)-Success/mg;
    const conditions = [];
    for (const children in injectDependsTo) {
      if (Object.hasOwn(injectDependsTo, children)) {
        for (const dependency in injectDependsTo[children]) {
          if (Object.hasOwn(injectDependsTo[children], dependency)) {
            const condition = injectDependsTo[children][dependency][values.inject_id];
            const splittedConditions = condition.split(breakpointAndOr);
            conditions.push({
              childrenId: dependency,
              mode: condition.includes('||') ? 'or' : 'and',
              conditionElement: splittedConditions.map((splitedCondition, index) => {
                const key = Array.from(splitedCondition.split(breakpointValue)[0].trim().matchAll(typeFromName), (m) => m[1]);
                return {
                  name: splitedCondition.split(breakpointValue)[0].trim(),
                  value: splitedCondition.split(breakpointValue)[1].trim(),
                  key: key[0],
                  index,
                };
              }),
            });
          }
        }
      }
    }
    return conditions;
  };

  const [parentConditions, setParentConditions] = useState(getConditionContentParent(values.inject_depends_on));
  const [childrenConditions, setChildrenConditions] = useState(getConditionContentChildren(values.inject_depends_to));

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

    const newDependsOn = {};
    newDependsOn[anyParent?.inject.inject_id] = `${anyParent?.inject.inject_id}-Execution-Success == true`;

    form.mutators.setValue(
      'inject_depends_on',
      anyParent?.inject.inject_id ? newDependsOn : null,
    );

    setParentConditions(getConditionContentParent(newDependsOn));
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

    const newDependsTo = [];

    for (let i = 0; i < newChildrens.length; i += 1) {
      const dependsToChildren = {};
      dependsToChildren[newChildrens[i].inject.inject_id] = {};
      dependsToChildren[newChildrens[i].inject.inject_id][values.inject_id] = `${values.inject_id}-Execution-Success == true`;
      newDependsTo.push(dependsToChildren);
    }

    form.mutators.setValue('inject_depends_to', newDependsTo);

    setChildrenConditions(getConditionContentChildren(newDependsTo));
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
  const addConditionParent = (parent) => {
    const { mode } = parentConditions.find((currentCondition) => parent.inject.inject_id === currentCondition.parentId);

    const newDependsOn = values.inject_depends_on;
    newDependsOn[parent.inject.inject_id] = `${values.inject_depends_on[parent.inject.inject_id]} ${mode === 'and' ? '&&' : '||'} ${parent.inject.inject_id}-Execution-Success == true`;
    form.mutators.setValue(
      'inject_depends_on',
      newDependsOn,
    );

    setParentConditions(getConditionContentParent(newDependsOn));
  };

  const addConditionChildren = (children) => {
    const { mode } = childrenConditions.find((currentCondition) => children.inject.inject_id === currentCondition.childrenId);

    let newDependsTo = {};
    newDependsTo = values.inject_depends_to.map((dependsToChildren) => {
      if (dependsToChildren[children.inject.inject_id] !== undefined) {
        const newValue = {};
        newValue[children.inject.inject_id] = {};
        newValue[children.inject.inject_id][values.inject_id] = `${dependsToChildren[children.inject.inject_id][values.inject_id]} ${mode === 'and' ? '&&' : '||'} ${values.inject_id}-Execution-Success == true`;
        return newValue;
      }
      return dependsToChildren;
    });
    form.mutators.setValue(
      'inject_depends_to',
      newDependsTo,
    );
    setChildrenConditions(getConditionContentChildren(newDependsTo));
  };

  const conditionsToStringParent = (conditions) => {
    const newConditions = {};

    for (const dependency in conditions) {
      if (Object.hasOwn(conditions, dependency)) {
        let writtenCondition = '';
        for (const conditionElementIndex in conditions[dependency].conditionElement) {
          if (Object.hasOwn(conditions[dependency].conditionElement, conditionElementIndex)) {
            writtenCondition += `${conditionElementIndex > 0 ? ' && ' : ''}${conditions[dependency].conditionElement[conditionElementIndex].name} == ${conditions[dependency].conditionElement[conditionElementIndex].value}`;
          }
        }
        newConditions[conditions[dependency].parentId] = writtenCondition;
      }
    }
    return newConditions;
  };

  const conditionsToStringChildren = (conditions) => {
    const newConditions = [];

    for (const dependency in conditions) {
      if (Object.hasOwn(conditions, dependency)) {
        let writtenCondition = '';
        for (const conditionElementIndex in conditions[dependency].conditionElement) {
          if (Object.hasOwn(conditions[dependency].conditionElement, conditionElementIndex)) {
            writtenCondition += `${conditionElementIndex > 0 ? '&& ' : ''}${conditions[dependency].conditionElement[conditionElementIndex].name} == ${conditions[dependency].conditionElement[conditionElementIndex].value}`;
          }
        }
        const newCondition = {};
        newCondition[conditions[dependency].childrenId] = {};
        newCondition[conditions[dependency].childrenId][values.inject_id] = writtenCondition;
        newConditions.push(newCondition);
      }
    }
    return newConditions;
  };

  const changeParentElement = (newElement, conditions, condition, parent) => {
    const newConditionElements = conditions.conditionElement.map((newConditionElement) => {
      if (newConditionElement.index === condition.index) {
        return {
          index: condition.index,
          key: newElement.key,
          name: `${conditions.parentId}-${newElement.key}-Success`,
          value: newElement.value === 'Success' ? 'true' : 'false',
        };
      }
      return newConditionElement;
    });
    const newParentConditions = parentConditions.map((parentCondition) => {
      if (parentCondition.parentId === parent.inject.inject_id) {
        return {
          ...parentCondition,
          conditionElement: newConditionElements,
        };
      }
      return parentCondition;
    });
    setParentConditions(newParentConditions);
    form.mutators.setValue(
      'inject_depends_on',
      conditionsToStringParent(newParentConditions),
    );
  };

  const changeChildrenElement = (newElement, conditions, condition, parent) => {
    const newConditionElements = conditions.conditionElement.map((newConditionElement) => {
      if (newConditionElement.index === condition.index) {
        return {
          index: condition.index,
          key: newElement.key,
          name: `${conditions.childrenId}-${newElement.key}-Success`,
          value: newElement.value === 'Success' ? 'true' : 'false',
        };
      }
      return newConditionElement;
    });
    const newChildrenConditions = childrenConditions.map((childrenCondition) => {
      if (childrenCondition.childrenId === parent.inject.inject_id) {
        return {
          ...childrenCondition,
          conditionElement: newConditionElements,
        };
      }
      return childrenCondition;
    });
    setChildrenConditions(newChildrenConditions);
    form.mutators.setValue(
      'inject_depends_to',
      conditionsToStringChildren(newChildrenConditions),
    );
  };

  const changeModeParent = (conditions, condition) => {
    const newConditionElements = conditions.map((currentCondition) => {
      if (currentCondition.parentId === condition.parentId) {
        return {
          ...currentCondition,
          mode: currentCondition.mode === 'and' ? 'or' : 'and',
        };
      }
      return currentCondition;
    });
    setParentConditions(newConditionElements);
  };

  const changeModeChildren = (conditions, condition) => {
    const newConditionElements = conditions.map((currentCondition) => {
      if (currentCondition.childrenId === condition.childrenId) {
        return {
          ...currentCondition,
          mode: currentCondition.mode === 'and' ? 'or' : 'and',
        };
      }
      return currentCondition;
    });
    setChildrenConditions(newConditionElements);
  };

  const deleteConditionParent = (conditions, condition) => {
    const newConditionElements = parentConditions.map((currentCondition) => {
      if (currentCondition.parentId === conditions.parentId) {
        return {
          ...currentCondition,
          conditionElement: currentCondition.conditionElement.filter((element) => element.index !== condition.index),
        };
      }
      return currentCondition;
    });
    setParentConditions(newConditionElements);
    form.mutators.setValue(
      'inject_depends_on',
      conditionsToStringParent(newConditionElements),
    );
  };

  const deleteConditionChildren = (conditions, condition) => {
    const newConditionElements = childrenConditions.map((currentCondition) => {
      if (currentCondition.childrenId === conditions.childrenId) {
        return {
          ...currentCondition,
          conditionElement: currentCondition.conditionElement.filter((element) => element.index !== condition.index),
        };
      }
      return currentCondition;
    });
    setChildrenConditions(newConditionElements);
    form.mutators.setValue(
      'inject_depends_to',
      conditionsToStringChildren(newConditionElements),
    );
  };

  const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getAvailableExpectations = (inject) => {
    if (inject.inject_content !== null && inject.inject_content !== undefined) {
      const expectations = inject.inject_content.expectations.map((expectation) => (expectation.expectation_type === 'MANUAL' ? expectation.expectation_name : capitalize(expectation.expectation_type)));
      return ['Execution', ...expectations];
    } if (inject.inject_injector_contract !== undefined
        && inject.inject_injector_contract.convertedContent.fields.find((field) => field.key === 'expectations')) {
      const expectations = inject.inject_injector_contract.convertedContent.fields
        .find((field) => field.key === 'expectations')
        .predefinedExpectations.map((expectation) => (expectation.expectation_type === 'MANUAL' ? expectation.expectation_name : capitalize(expectation.expectation_type)));
      return ['Execution', ...expectations];
    }
    return ['Execution'];
  };

  const getClickableParentChip = (parent) => {
    const parentChip = parentConditions.find((parentCondition) => parent.inject !== undefined && parentCondition.parentId === parent.inject.inject_id);
    if (parentChip === undefined) return (<></>);
    return parentChip.conditionElement.map((condition, conditionIndex) => {
      const conditions = parentConditions
        .find((parentCondition) => parent.inject !== undefined && parentCondition.parentId === parent.inject.inject_id);
      if (conditionIndex < conditions.conditionElement.length - 1) {
        return (<><ClickableChip
          style={{ borderRadius: 4 }}
          key={`${condition.name}-${condition.index}`}
          selectedElement={{ key: condition.key, operator: 'is', value: condition.value === 'true' ? 'Success' : 'Fail' }}
          pristine={true}
          availableKeys={getAvailableExpectations(parent.inject)}
          availableOperators={['is']}
          availableValues={['Success', 'Fail']}
          onDelete={
              conditions.conditionElement.length > 1 ? () => { deleteConditionParent(conditions, condition); } : undefined
            }
          onChange={(newElement) => {
            changeParentElement(newElement, conditions, condition, parent);
          }}
                  /><ClickableModeChip
                    mode={conditions.mode}
                    onClick={() => { changeModeParent(parentConditions, conditions); }}
                    /></>);
      }
      return (<ClickableChip
        key={`${condition.name}-${condition.index}`}
        style={{ borderRadius: 4 }}
        selectedElement={{ key: condition.key, operator: 'is', value: condition.value === 'true' ? 'Success' : 'Fail' }}
        pristine={true}
        availableKeys={getAvailableExpectations(parent.inject)}
        availableOperators={['is']}
        availableValues={['Success', 'Fail']}
        onDelete={
            conditions.conditionElement.length > 1 ? () => { deleteConditionParent(conditions, condition); } : undefined
          }
        onChange={(newElement) => {
          changeParentElement(newElement, conditions, condition, parent);
        }}
              />);
    });
  };

  const getClickableChildrenChip = (children) => {
    const childrenChip = childrenConditions.find((childrenCondition) => children.inject !== undefined && childrenCondition.childrenId === children.inject.inject_id);
    if (childrenChip === undefined) return (<></>);
    return childrenChip
      .conditionElement.map((condition, conditionIndex) => {
        const conditions = childrenConditions
          .find((childrenCondition) => childrenCondition.childrenId === children.inject.inject_id);
        if (conditionIndex < conditions.conditionElement.length - 1) {
          return (<><ClickableChip
            style={{ borderRadius: 4 }}
            key={`${condition.name}-${condition.index}`}
            selectedElement={{ key: condition.key, operator: 'is', value: condition.value === 'true' ? 'Success' : 'Fail' }}
            pristine={true}
            availableKeys={getAvailableExpectations(injects.find((currentInject) => currentInject.inject_id === values.inject_id))}
            availableOperators={['is']}
            availableValues={['Success', 'Fail']}
            onDelete={
                  conditions.conditionElement.length > 1 ? () => { deleteConditionChildren(conditions, condition); } : undefined
                }
            onChange={(newElement) => {
              changeChildrenElement(newElement, conditions, condition, children);
            }}
                    /><ClickableModeChip
                      mode={conditions.mode}
                      onClick={() => { changeModeChildren(childrenConditions, conditions); }}
                      /></>);
        }
        return (<ClickableChip
          key={`${condition.name}-${condition.index}`}
          style={{ borderRadius: 4 }}
          selectedElement={{ key: condition.key, operator: 'is', value: condition.value === 'true' ? 'Success' : 'Fail' }}
          pristine={true}
          availableKeys={getAvailableExpectations(injects.find((currentInject) => currentInject.inject_id === values.inject_id))}
          availableOperators={['is']}
          availableValues={['Success', 'Fail']}
          onDelete={
                conditions.conditionElement.length > 1 ? () => { deleteConditionChildren(conditions, condition); } : undefined
              }
          onChange={(newElement) => {
            changeChildrenElement(newElement, conditions, condition, children);
          }}
                />);
      });
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
                <label className={classes.labelExecutionCondition}>{t('Execution condition:')}</label>
                <Box
                  sx={{
                    padding: '12px 4px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {getClickableParentChip(parent)}
                </Box>
                <Button
                  color="secondary"
                  aria-label="Add"
                  size="large"
                  onClick={() => {
                    addConditionParent(parent);
                  }}
                  style={{ justifyContent: 'start' }}
                >
                  <Add fontSize="small"/>
                  <Typography>
                    {t('Add condition')}
                  </Typography>
                </Button>
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
                <label className={classes.labelExecutionCondition}>{t('Execution condition:')}</label>

                <Box
                  sx={{
                    padding: '12px 4px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  {getClickableChildrenChip(children)}
                </Box>
                <Button
                  color="secondary"
                  aria-label="Add"
                  size="large"
                  onClick={() => {
                    addConditionChildren(children);
                  }}
                  style={{ justifyContent: 'start' }}
                >
                  <Add fontSize="small"/>
                  <Typography>
                    {t('Add condition')}
                  </Typography>
                </Button>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
};

export default InjectForm;
