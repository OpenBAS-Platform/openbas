import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, DeleteOutlined, ExpandMore } from '@mui/icons-material';
import { FormApi } from 'final-form';
import { Value } from 'classnames';
import { useFormatter } from '../../../../components/i18n';
import ClickableModeChip from '../../../../components/common/chips/ClickableModeChip';
import ClickableChip from '../../../../components/common/chips/ClickableChip';
import { capitalize } from '../../../../utils/String';
import type { InjectDependency } from '../../../../utils/api-types';
import type { InjectOutputType } from '../../../../actions/injects/Inject';
import type { Element } from '../../../../components/common/chips/ClickableChip';

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

interface Props {
  values: InjectOutputType & { inject_depends_to: InjectDependency[] },
  form: FormApi<InjectOutputType & { inject_depends_to: InjectDependency[] }>,
  injects?: InjectOutputType[],
}

interface ConditionElement {
  name: string,
  value: boolean,
  key: string,
  index: number,
}

interface ConditionType {
  parentId?: string,
  childrenId?: string,
  mode?: string,
  conditionElement?: ConditionElement[],
}

interface Dependency {
  inject?: InjectOutputType,
  index: number,
}

const InjectForm: React.FC<Props> = ({ values, form, injects }) => {
  const classes = useStyles();
  const { t } = useFormatter();

  // List of parents
  const [parents, setParents] = useState<Dependency[]>(
    () => {
      if (values.inject_depends_on) {
        return values.inject_depends_on?.filter((searchInject) => searchInject.dependency_relationship?.inject_children_id === values.inject_id)
          .map((inject, index) => {
            return {
              inject: injects?.find((currentInject) => currentInject.inject_id === inject.dependency_relationship?.inject_parent_id),
              index,
            };
          });
      }
      return [];
    },

  );

  // List of childrens
  const [childrens, setChildrens] = useState<Dependency[]>(
    () => {
      if (values.inject_depends_on) {
        return values.inject_depends_on?.filter((searchInject) => searchInject.dependency_relationship?.inject_parent_id === values.inject_id)
          .map((inject, index) => {
            return {
              inject: injects?.find((currentInject) => currentInject.inject_id === inject.dependency_relationship?.inject_children_id),
              index,
            };
          });
      }
      return [];
    },
  );

  // Property to deactivate the add children button if there are no children available anymore
  const [addChildrenButtonDisabled, setAddChildrenButtonDisabled] = useState(false);
  useEffect(() => {
    const availableChildrensNumber = injects ? injects.filter((currentInject) => currentInject.inject_depends_duration > values.inject_depends_duration).length : 0;
    setAddChildrenButtonDisabled(childrens ? childrens.length >= availableChildrensNumber : true);
  }, [childrens]);

  /**
   * Transform an inject dependency into ConditionElement
   * @param injectDependsOn an array of injectDependency
   */
  const getConditionContentParent = (injectDependsOn: InjectDependency[]) => {
    const conditions: ConditionType[] = [];
    if (injectDependsOn) {
      injectDependsOn.forEach((parent) => {
        conditions.push({
          parentId: parent.dependency_relationship?.inject_parent_id,
          mode: parent.dependency_condition?.mode,
          conditionElement: parent.dependency_condition?.conditions?.map((dependencyCondition, indexCondition) => {
            return {
              name: dependencyCondition.key,
              value: dependencyCondition.value!,
              key: dependencyCondition.key,
              index: indexCondition,
            };
          }),
        });
      });
    }
    return conditions;
  };

  /**
   * Transform an inject dependency into ConditionElement
   * @param injectDependsTo an array of injectDependency
   */
  const getConditionContentChildren = (injectDependsTo: InjectDependency[]) => {
    const conditions: ConditionType[] = [];
    injectDependsTo.forEach((children) => {
      conditions.push({
        childrenId: children.dependency_relationship?.inject_children_id,
        mode: children.dependency_condition?.mode,
        conditionElement: children.dependency_condition?.conditions?.map((dependencyCondition, indexCondition) => {
          return {
            name: dependencyCondition.key,
            value: dependencyCondition.value!,
            key: dependencyCondition.key,
            index: indexCondition,
          };
        }),
      });
    });
    return conditions;
  };

  const [parentConditions, setParentConditions] = useState(getConditionContentParent(values.inject_depends_on ? values.inject_depends_on : []));
  const [childrenConditions, setChildrenConditions] = useState(getConditionContentChildren(values.inject_depends_to));

  /**
   * Handle the change of the parent
   * @param _event the event
   * @param parent the parent key
   */
  const handleChangeParent = (_event: SelectChangeEvent<Value>, parent: ReactNode) => {
    const rx = /\.\$select-parent-(.*)-inject-(.*)/g;
    if (!parent) return;
    let key = '';
    const parentElement = parent as ReactElement;
    if ('key' in parentElement && parentElement.key !== null) {
      key = parentElement.key;
    }
    if (key === null) {
      return;
    }
    const arr = rx.exec(key);

    if (parents === undefined || arr === null || injects === undefined) return;
    const newInject = injects.find((currentInject) => currentInject.inject_id === arr[2]);
    const newParents = parents
      .map((element) => {
        if (element.index === parseInt(arr[1], 10)) {
          const baseInjectDependency: InjectDependency = {
            dependency_relationship: {
              inject_parent_id: newInject?.inject_id,
              inject_children_id: values.inject_id,
            },
            dependency_condition: {
              conditions: [
                {
                  key: 'Execution',
                  operator: '==',
                  value: true,
                },
              ],
              mode: '&&',
            },
          };
          newInject!.inject_depends_on = [baseInjectDependency];
          return {
            inject: newInject!,
            index: element.index,
          };
        }
        return element;
      });

    setParents(newParents);

    form.mutators.setValue(
      'inject_depends_on',
      newParents,
    );

    if (newInject!.inject_depends_on !== null) {
      setParentConditions(getConditionContentParent(newInject!.inject_depends_on!));
    }
  };

  const addParent = () => {
    setParents([...parents, { inject: undefined, index: parents.length }]);
  };

  const handleChangeChildren = (_event: SelectChangeEvent<string>, child: ReactNode) => {
    const rx = /\.\$select-children-(.*)-inject-(.*)/g;
    if (!child) return;
    let key = '';
    const childElement = (child as ReactElement);
    if ('key' in (childElement as ReactElement) && childElement.key !== null) {
      key = childElement.key;
    }
    if (key === null) {
      return;
    }
    const arr = rx.exec(key);

    if (childrens === undefined || arr === null || injects === undefined) return;
    const newInject = injects.find((currentInject) => currentInject.inject_id === arr[2]);
    const newChildrens = childrens
      .map((element) => {
        if (element.index === parseInt(arr[1], 10)) {
          const baseInjectDependency: InjectDependency = {
            dependency_relationship: {
              inject_parent_id: values.inject_id,
              inject_children_id: newInject?.inject_id,
            },
            dependency_condition: {
              conditions: [
                {
                  key: 'Execution',
                  operator: '==',
                  value: true,
                },
              ],
              mode: '&&',
            },
          };
          newInject!.inject_depends_on = [baseInjectDependency];
          return {
            inject: newInject!,
            index: element.index,
          };
        }
        return element;
      });

    setChildrens(newChildrens);

    form.mutators.setValue('inject_depends_to', newChildrens);

    if (newInject!.inject_depends_on !== null) {
      setChildrenConditions(getConditionContentChildren(newInject!.inject_depends_on!));
    }
  };

  const addChildren = () => {
    setChildrens([...childrens, { inject: undefined, index: childrens.length }]);
  };

  const deleteParent = (parent: Dependency) => {
    const parentIndexInArray = parents.findIndex((currentParent) => currentParent.index === parent.index);

    if (parentIndexInArray > -1) {
      const newParents = [
        ...parents.slice(0, parentIndexInArray),
        ...parents.slice(parentIndexInArray + 1),
      ];
      setParents(newParents);

      form.mutators.setValue(
        'inject_depends_on',
        newParents,
      );
    }
  };

  const deleteChildren = (children: Dependency) => {
    const childrenIndexInArray = childrens.findIndex((currentChildren) => currentChildren.index === children.index);

    if (childrenIndexInArray > -1) {
      const newChildrens = [
        ...childrens.slice(0, childrenIndexInArray),
        ...childrens.slice(childrenIndexInArray + 1),
      ];
      setChildrens(newChildrens);

      form.mutators.setValue('inject_depends_to', newChildrens);
    }
  };

  const addConditionParent = (parent: Dependency) => {
    const { conditionElement } = parentConditions.find((currentCondition) => parent.inject!.inject_id === currentCondition.parentId)!;

    conditionElement?.push({
      key: 'Execution',
      name: 'Execution',
      value: true,
      index: conditionElement?.length,
    });

    form.mutators.setValue(
      'inject_depends_on',
      parents,
    );

    setParentConditions(parentConditions);
  };

  const addConditionChildren = (children: Dependency) => {
    const { conditionElement } = childrenConditions.find((currentCondition) => children.inject!.inject_id === currentCondition.childrenId)!;

    conditionElement?.push({
      key: 'Execution',
      name: 'Execution',
      value: true,
      index: conditionElement?.length,
    });

    setChildrenConditions(childrenConditions);
    form.mutators.setValue(
      'inject_depends_to',
      childrens,
    );
  };

  const changeParentElement = (newElement: Element, conditions: ConditionType, condition: ConditionElement, parent: Dependency) => {
    const newConditionElements = conditions.conditionElement?.map((newConditionElement) => {
      if (newConditionElement.index === condition.index) {
        return {
          index: condition.index,
          key: newElement.key,
          name: `${conditions.parentId}-${newElement.key}-Success`,
          value: newElement.value === 'Success',
        };
      }
      return newConditionElement;
    });
    const newParentConditions = parentConditions.map((parentCondition) => {
      if (parentCondition.parentId === parent.inject?.inject_id) {
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
      parents,
    );
  };

  const changeChildrenElement = (newElement: Element, conditions: ConditionType, condition: ConditionElement, parent: Dependency) => {
    const newConditionElements = conditions.conditionElement?.map((newConditionElement) => {
      if (newConditionElement.index === condition.index) {
        return {
          index: condition.index,
          key: newElement.key,
          name: `${conditions.childrenId}-${newElement.key}-Success`,
          value: newElement.value === 'Success',
        };
      }
      return newConditionElement;
    });
    const newChildrenConditions = childrenConditions.map((childrenCondition) => {
      if (childrenCondition.childrenId === parent.inject?.inject_id) {
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
      childrens,
    );
  };

  const changeModeParent = (conditions: ConditionType[] | undefined, condition: ConditionType) => {
    const newConditionElements = conditions?.map((currentCondition) => {
      if (currentCondition.parentId === condition.parentId) {
        return {
          ...currentCondition,
          mode: currentCondition.mode === '&&' ? '||' : '&&',
        };
      }
      return currentCondition;
    });
    if (newConditionElements !== undefined) {
      setParentConditions(newConditionElements);
    }
  };

  const changeModeChildren = (conditions: ConditionType[] | undefined, condition: ConditionType) => {
    const newConditionElements = conditions?.map((currentCondition) => {
      if (currentCondition.childrenId === condition.childrenId) {
        return {
          ...currentCondition,
          mode: currentCondition.mode === '&&' ? '||' : '&&',
        };
      }
      return currentCondition;
    });
    if (newConditionElements !== undefined) {
      setChildrenConditions(newConditionElements);
    }
  };

  const deleteConditionParent = (conditions: ConditionType, condition: ConditionElement) => {
    const newConditionElements = parentConditions.map((currentCondition) => {
      if (currentCondition.parentId === conditions.parentId) {
        return {
          ...currentCondition,
          conditionElement: currentCondition.conditionElement?.filter((element) => element.index !== condition.index),
        };
      }
      return currentCondition;
    });
    setParentConditions(newConditionElements);
    form.mutators.setValue(
      'inject_depends_on',
      parents,
    );
  };

  const deleteConditionChildren = (conditions: ConditionType, condition: ConditionElement) => {
    const newConditionElements = childrenConditions.map((currentCondition) => {
      if (currentCondition.childrenId === conditions.childrenId) {
        return {
          ...currentCondition,
          conditionElement: currentCondition.conditionElement?.filter((element) => element.index !== condition.index),
        };
      }
      return currentCondition;
    });
    setChildrenConditions(newConditionElements);
    form.mutators.setValue(
      'inject_depends_to',
      childrens,
    );
  };

  interface content {
    expectations: {
      expectation_type: string,
      expectation_name: string,
    }[]
  }

  interface ConvertedContentType {
    fields: {
      key: string
      value: string,
      predefinedExpectations: {
        expectation_type: string,
        expectation_name: string,
      }[]
    }[],
  }

  const getAvailableExpectations = (inject: InjectOutputType | undefined) => {
    if (inject?.inject_content !== null && inject?.inject_content !== undefined) {
      const expectations = (inject.inject_content as content).expectations.map((expectation) => (expectation.expectation_type === 'MANUAL' ? expectation.expectation_name : capitalize(expectation.expectation_type)));
      return ['Execution', ...expectations];
    }
    if (inject?.inject_injector_contract !== undefined
        && (inject?.inject_injector_contract.convertedContent as unknown as ConvertedContentType).fields.find((field) => field.key === 'expectations')) {
      const predefinedExpectations = (inject.inject_injector_contract.convertedContent as unknown as ConvertedContentType).fields?.find((field) => field.key === 'expectations')
        ?.predefinedExpectations.map((expectation) => (expectation.expectation_type === 'MANUAL' ? expectation.expectation_name : capitalize(expectation.expectation_type)));
      if (predefinedExpectations !== undefined) {
        return ['Execution', ...predefinedExpectations];
      }
    }
    return ['Execution'];
  };

  const canParentAddConditions = (element: Dependency) => {
    const expectationsNumber = getAvailableExpectations(element.inject).length;
    const parentElement = parentConditions.find((parentCondition) => element.inject !== undefined && parentCondition.parentId === element.inject.inject_id);
    if (parentElement === undefined || parentElement.conditionElement === undefined) return true;

    return parentElement?.conditionElement.length < expectationsNumber;
  };

  const canChildrenAddConditions = (element: Dependency) => {
    const expectationsNumber = getAvailableExpectations(element.inject).length;
    const childrenElement = childrenConditions.find((childrenCondition) => element.inject !== undefined && childrenCondition.childrenId === element.inject.inject_id);
    if (childrenElement === undefined || childrenElement.conditionElement === undefined) return true;

    return childrenElement?.conditionElement.length < expectationsNumber;
  };

  const getClickableParentChip = (parent: Dependency) => {
    const parentChip = parentConditions.find((parentCondition) => parent.inject !== undefined && parentCondition.parentId === parent.inject.inject_id);
    if (parentChip === undefined || parentChip.conditionElement === undefined) return (<></>);
    return parentChip.conditionElement.map((condition, conditionIndex) => {
      const conditions = parentConditions
        .find((parentCondition) => parent.inject !== undefined && parentCondition.parentId === parent.inject.inject_id);
      if (conditions?.conditionElement !== undefined) {
        return (<><ClickableChip
          key={`${condition.name}-${condition.index}`}
          selectedElement={{ key: condition.key, operator: 'is', value: condition.value ? 'Success' : 'Fail' }}
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
                  />
          {conditionIndex < conditions.conditionElement.length - 1
             && <ClickableModeChip
               mode={conditions.mode}
               onClick={() => { changeModeParent(parentConditions, conditions); }}
                />
          }</>);
      }
      return (<></>);
    });
  };

  const getClickableChildrenChip = (children: Dependency) => {
    const childrenChip = childrenConditions.find((childrenCondition) => children.inject !== undefined && childrenCondition.childrenId === children.inject.inject_id);
    if (childrenChip?.conditionElement === undefined) return (<></>);
    return childrenChip
      .conditionElement.map((condition, conditionIndex) => {
        const conditions = childrenConditions
          .find((childrenCondition) => childrenCondition.childrenId === children.inject?.inject_id);
        if (conditions?.conditionElement !== undefined) {
          return (<><ClickableChip
            key={`${condition.name}-${condition.index}`}
            selectedElement={{ key: condition.key, operator: 'is', value: condition.value ? 'Success' : 'Fail' }}
            pristine={true}
            availableKeys={getAvailableExpectations(injects?.find((currentInject) => currentInject.inject_id === values.inject_id))}
            availableOperators={['is']}
            availableValues={['Success', 'Fail']}
            onDelete={
                  conditions.conditionElement.length > 1 ? () => { deleteConditionChildren(conditions, condition); } : undefined
                }
            onChange={(newElement) => {
              changeChildrenElement(newElement, conditions, condition, children);
            }}
                    />
            {conditionIndex < conditions.conditionElement.length - 1
                && <ClickableModeChip
                  mode={conditions?.mode}
                  onClick={() => { changeModeChildren(childrenConditions, conditions); }}
                   />
            }</>);
        }
        return (<></>);
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
          disabled={parents.length > 0
              || injects?.filter((currentInject) => currentInject.inject_depends_duration < values.inject_depends_duration).length === 0}
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
                  value={parents[parent.index].inject ? parents[parent.index].inject?.inject_id : ''}
                  onChange={handleChangeParent}
                >
                  {injects?.filter((currentInject) => currentInject.inject_depends_duration < values.inject_depends_duration
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
                <div style={{ justifyContent: 'left' }}>
                  <Button
                    color="secondary"
                    aria-label="Add"
                    size="large"
                    onClick={() => {
                      addConditionParent(parent);
                    }}
                    style={{ justifyContent: 'start' }}
                    disabled={!canParentAddConditions(parent)}
                  >
                    <Add fontSize="small"/>
                    <Typography>
                      {t('Add condition')}
                    </Typography>
                  </Button>
                </div>
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
          disabled={addChildrenButtonDisabled}
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
                  value={childrens.find((childrenSearch) => children.index === childrenSearch.index)?.inject
                    ? childrens.find((childrenSearch) => children.index === childrenSearch.index)?.inject?.inject_id : ''}
                  onChange={handleChangeChildren}
                >
                  {injects?.filter((currentInject) => currentInject.inject_depends_duration > values.inject_depends_duration
                        && (childrens.find((childrenSearch) => currentInject.inject_id === childrenSearch.inject?.inject_id) === undefined
                            || childrens.find((childrenSearch) => children.index === childrenSearch.index)?.inject?.inject_id === currentInject.inject_id))
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
                <div style={{ justifyContent: 'left' }}>
                  <Button
                    color="secondary"
                    aria-label="Add"
                    size="large"
                    onClick={() => {
                      addConditionChildren(children);
                    }}
                    disabled={!canChildrenAddConditions(children)}
                    style={{ justifyContent: 'start' }}
                  >
                    <Add fontSize="small"/>
                    <Typography>
                      {t('Add condition')}
                    </Typography>
                  </Button>
                </div>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
};

export default InjectForm;
