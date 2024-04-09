import React, { FunctionComponent, useContext, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InjectDefinition from '../../components/injects/InjectDefinition';
import { InjectContext, PermissionsContext } from '../../components/Context';
import type { AtomicTestingInput, ScenarioInput, Tag } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import { Contract } from '../../../../utils/api-types';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';
import { zodImplement } from '../../../../utils/Zod';
import { useFormatter } from '../../../../components/i18n';

interface Props {
  contractId: string;
  injectType: string;
  onSubmit: SubmitHandler<AtomicTestingInput>;
  initialValues?: AtomicTestingInput;
}

const CreationInjectType: FunctionComponent<Props> = ({
  contractId, injectType, onSubmit,
  initialValues = {
    inject_title: '',
    inject_description: '',
    inject_type: '',
    inject_all_teams: '',
    inject_teams: '',
    inject_asset_groups: '',
    inject_assets: '',
    inject_content: '',
    inject_contract: '',
    inject_documents: '',
    inject_tags: '',
  },
}) => {
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);
  const { onUpdateInject } = useContext(InjectContext);
  const { onCreateAtomicTest } = useContext(InjectContext);
  const [setSelectedInject] = useState(null);
  const { injectTypesMap, tagsMap }: {
    injectTypesMap: Record<string, Contract>,
    tagsMap: Record<string, Tag>,
  } = useHelper((helper: InjectHelper & TagsHelper) => ({
    injectTypesMap: helper.getInjectTypesMap(),
    tagsMap: helper.getTagsMap(),
  }));
  const injectTypes = Object.values(injectTypesMap);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AtomicTestingInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<AtomicTestingInput>().with({
        inject_title: z.string().min(1, { message: t('Should not be empty') }),
        inject_description: z.string().optional(),
        inject_type: z.string().optional(),
        inject_all_teams: z.boolean().optional(),
        inject_teams: z.string().array().optional(),
        inject_asset_groups: z.string().array().optional(),
        inject_assets: z.string().array().optional(),
        inject_content: z.object().optional(),
        inject_contract: z.string().optional(),
        inject_documents: z.string().array().optional(),
        inject_tags: z.string().array().optional(),
      }),
    ),
    defaultValues: initialValues,
  });
  return (
    <form id="atomicdetails" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h2" style={{ float: 'left', marginLeft: 12 }}>
        Title
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        sx={{ m: 1 }}
        name="inject_title"
        error={!!errors.inject_title}
        helperText={errors.inject_title?.message}
        inputProps={register('inject_title')}
        InputLabelProps={{ required: true }}
      />
      <InjectDefinition
        inject={{
          // inject_title:inject_title,
          inject_contract: contractId,
          inject_type: injectType,
          inject_teams: [],
          inject_assets: [],
          inject_asset_groups: [],
          inject_documents: [],
        }}
        injectTypes={injectTypes}
        handleClose={() => setSelectedInject(null)}
        tagsMap={tagsMap}
        permissions={permissions}
        teamsFromExerciseOrScenario={[]}
        articlesFromExerciseOrScenario={[]}
        variablesFromExerciseOrScenario={[]}
        onUpdateInject={onUpdateInject}
        uriVariable={''}
        allUsersNumber={0}
        usersNumber={0}
        teamsUsers={0}
        creation={true}
        createAtomicTest={onCreateAtomicTest}
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default CreationInjectType;
