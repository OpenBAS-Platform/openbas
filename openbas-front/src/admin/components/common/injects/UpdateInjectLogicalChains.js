import React, { useContext } from 'react';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { makeStyles } from '@mui/styles';
import { Avatar, Button, Card, CardContent, CardHeader } from '@mui/material';
import { HelpOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import PlatformIcon from '../../../../components/PlatformIcon';
import InjectChainsForm from './InjectChainsForm';
import { InjectContext } from '../Context';

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
  const injectContext = useContext(InjectContext);

  const initialValues = {
    ...inject,
    inject_depends_to: injects
      .filter((currentInject) => currentInject.inject_depends_on === inject.inject_id)
      .map((currentInject) => currentInject.inject_id),
  };

  const onSubmit = async (data) => {
    const injectUpdate = {
      inject_title: data.inject_title,
      inject_injector_contract: data.inject_injector_contract.injector_contract_id,
      inject_description: data.inject_description,
      inject_tags: data.inject_tags,
      inject_content: data.inject_content,
      inject_all_teams: data.inject_all_teams,
      inject_teams: data.inject_teams,
      inject_assets: data.inject_assets,
      inject_asset_groups: data.inject_asset_groups,
      inject_documents: data.inject_documents,
      inject_depends_duration: data.inject_depends_duration,
      inject_depends_on: data.inject_depends_on,
    };
    await onUpdateInject(injectUpdate);

    const childrenIds = data.inject_depends_to;
    childrenIds.forEach((childrenId) => {
      const children = injects.find((currentInject) => currentInject.inject_id === childrenId);
      if (children !== undefined) {
        const injectChildrenUpdate = {
          inject_title: children.inject_title,
          inject_injector_contract: children.inject_injector_contract.injector_contract_id,
          inject_description: children.inject_description,
          inject_tags: children.inject_tags,
          inject_content: children.inject_content,
          inject_all_teams: children.inject_all_teams,
          inject_teams: children.inject_teams,
          inject_assets: children.inject_assets,
          inject_asset_groups: children.inject_asset_groups,
          inject_documents: children.inject_documents,
          inject_depends_duration: children.inject_depends_duration,
          inject_depends_on: inject.inject_id,
        };
        injectContext.onUpdateInject(children.inject_id, injectChildrenUpdate);
      }
    });

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
