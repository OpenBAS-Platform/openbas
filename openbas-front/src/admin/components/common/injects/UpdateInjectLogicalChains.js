import React from 'react';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { makeStyles } from '@mui/styles';
import { Avatar, Button, Card, CardContent, CardHeader } from '@mui/material';
import { HelpOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import PlatformIcon from '../../../../components/PlatformIcon';
import InjectChainsForm from './InjectChainsForm';

const useStyles = makeStyles((theme) => ({
  injectorContract: {
    margin: '10px 0 20px 0',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
  },
  injectorContractContent: {
    fontSize: 18,
    textAlign: 'center',
  },
  injectorContractHeader: {
    backgroundColor: theme.palette.background.default,
  },
}));

const UpdateInjectLogicalChains = ({
  inject,
  handleClose,
  onUpdateInject,
  injects,
}) => {
  const { t, tPick } = useFormatter();
  const classes = useStyles();

  const injectDependsOn = {};
  if (inject.inject_depends_on !== null) {
    for (let i = 0; i < inject.inject_depends_on.length; i += 1) {
      injectDependsOn[inject.inject_depends_on[i].dependency_relationship.inject_parent_id] = inject.inject_depends_on[i].dependency_condition;
    }
  }
  console.log(injectDependsOn);

  const initialValues = {
    ...inject,
    inject_depends_to: injects
      .filter((currentInject) => currentInject.inject_depends_on !== null && currentInject.inject_depends_on[inject.inject_id] !== undefined)
      .map((currentInject) => {
        const inject_depends = {};
        inject_depends[currentInject.inject_id] = currentInject.inject_depends_on;
        return inject_depends;
      }),
    inject_depends_on: inject.inject_depends_on !== null ? injectDependsOn : null,
  };

  const onSubmit = async (data) => {
    const injectUpdate = {
      ...data,
      inject_id: data.inject_id,
      inject_injector_contract: data.inject_injector_contract.injector_contract_id,
      inject_depends_on: data.inject_depends_on,
    };

    const injectsToUpdate = [];

    console.log(data.inject_depends_to);
    const childrenIds = data.inject_depends_to.flatMap((childrenInject) => Object.keys(childrenInject));
    const injectsWithoutDependencies = injects
      .filter((currentInject) => currentInject.inject_depends_on !== null
        && currentInject.inject_depends_on[data.inject_id] !== undefined
        && !childrenIds.includes(currentInject.inject_id))
      .map((currentInject) => {
        return {
          ...currentInject,
          inject_id: currentInject.inject_id,
          inject_injector_contract: currentInject.inject_injector_contract.injector_contract_id,
          inject_depends_on: undefined,
        };
      });

    injectsToUpdate.push(...injectsWithoutDependencies);

    childrenIds.forEach((childrenId) => {
      const children = injects.find((currentInject) => currentInject.inject_id === childrenId);
      if (children !== undefined) {
        const injectDependsOnUpdate = {};
        for (let i = 0; i < data.inject_depends_to.length; i += 1) {
          if (data.inject_depends_to[i][childrenId] !== undefined) {
            injectDependsOnUpdate[inject.inject_id] = data.inject_depends_to[i][childrenId][inject.inject_id];
          }
        }

        const injectChildrenUpdate = {
          ...children,
          inject_id: children.inject_id,
          inject_injector_contract: children.inject_injector_contract.injector_contract_id,
          inject_depends_on: injectDependsOnUpdate,
        };
        injectsToUpdate.push(injectChildrenUpdate);
      }
    });

    await onUpdateInject([injectUpdate, ...injectsToUpdate]);

    handleClose();
  };
  const injectorContractContent = JSON.parse(inject.inject_injector_contract.injector_contract_content);
  return (
    <>
      <Card elevation={0} classes={{ root: classes.injectorContract }}>
        <CardHeader
          classes={{ root: classes.injectorContractHeader }}
          avatar={injectorContractContent?.config?.type ? <Avatar sx={{ width: 24, height: 24 }} src={`/api/images/injectors/${injectorContractContent.config.type}`} />
            : <Avatar sx={{ width: 24, height: 24 }}><HelpOutlined /></Avatar>}
          title={inject?.contract_attack_patterns_external_ids?.join(', ')}
          action={<div style={{ display: 'flex', alignItems: 'center' }}>
            {inject?.inject_injector_contract?.injector_contract_platforms?.map(
              (platform) => <PlatformIcon key={platform} width={20} platform={platform} marginRight={10} />,
            )}
          </div>}
        />
        <CardContent classes={{ root: classes.injectorContractContent }}>
          {tPick(inject?.inject_injector_contract?.injector_contract_labels)}
        </CardContent>
      </Card>
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        mutators={{
          ...arrayMutators,
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ form, handleSubmit, values, errors }) => {
          return (
            <form id="injectContentForm" onSubmit={handleSubmit} style={{ marginTop: 10 }}>
              <InjectChainsForm
                form={form}
                values={values}
                injects={injects}
              />
              <div style={{ float: 'right', marginTop: 20 }}>
                <Button
                  variant="contained"
                  onClick={handleClose}
                  style={{ marginRight: 10 }}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  disabled={Object.keys(errors).length > 0 }
                >
                  {t('Update')}
                </Button>
              </div>
            </form>
          );
        }}
      </Form>
    </>
  );
};

export default UpdateInjectLogicalChains;
