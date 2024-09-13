import React, { useContext, useState } from 'react';
import * as R from 'ramda';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { makeStyles } from '@mui/styles';
import { Avatar, Button, Card, CardContent, CardHeader } from '@mui/material';
import { ArrowDropDownOutlined, ArrowDropUpOutlined, HelpOutlined } from '@mui/icons-material';
import InjectDefinition from './InjectDefinition';
import { PermissionsContext } from '../Context';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchTags } from '../../../../actions/Tag';
import InjectForm from './InjectForm';
import { useFormatter } from '../../../../components/i18n';
import { isEmptyField } from '../../../../utils/utils';
import { tagOptions } from '../../../../utils/Option';
import { splitDuration } from '../../../../utils/Time';
import PlatformIcon from '../../../../components/PlatformIcon';

const useStyles = makeStyles((theme) => ({
  details: {
    marginTop: 20,
  },
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
  openDetails: {
    width: '100%',
    height: 40,
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    textTransform: 'uppercase',
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  injectorContractHeader: {
    backgroundColor: theme.palette.background.default,
  },
}));

const UpdateInjectDetails = ({
  contractContent,
  inject,
  handleClose,
  onUpdateInject,
  isAtomic = false,
  drawerRef,
  teamsFromExerciseOrScenario,
  ...props
}) => {
  const { t, tPick } = useFormatter();
  const classes = useStyles();
  const { permissions } = useContext(PermissionsContext);
  const [openDetails, setOpenDetails] = useState(true);
  const [injectDetailsState, setInjectDetailsState] = useState({});
  const dispatch = useAppDispatch();
  const { tagsMap } = useHelper((helper) => ({
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchTeams());
    dispatch(fetchTags());
  });

  const toggleInjectContent = () => {
    if (openDetails) {
      // eslint-disable-next-line no-param-reassign
      drawerRef.current.scrollTop = 0;
      setOpenDetails(false);
    } else {
      setOpenDetails(true);
    }
  };
  const validate = (values) => {
    const errors = {};
    if (openDetails && contractContent && Array.isArray(contractContent.fields)) {
      contractContent.fields
        .filter(
          (f) => !['teams', 'assets', 'assetgroups', 'articles', 'challenges', 'attachments', 'expectations'].includes(
            f.key,
          ),
        )
        .forEach((field) => {
          const value = values[field.key];
          if (field.mandatory && (value === undefined || R.isEmpty(value))) {
            errors[field.key] = t('This field is required.');
          }
          if (field.mandatoryGroups) {
            const { mandatoryGroups } = field;
            const conditionOk = mandatoryGroups?.some((mandatoryKey) => {
              const v = values[mandatoryKey];
              return v !== undefined && !R.isEmpty(v);
            });
            // If condition are not filled
            if (!conditionOk) {
              const labels = mandatoryGroups.map((key) => contractContent.fields.find((f) => f.key === key).label).join(', ');
              errors[field.key] = t(`One of this field is required : ${labels}.`);
            }
          }
        });
    }
    const requiredFields = [
      'inject_title',
      'inject_depends_duration_days',
      'inject_depends_duration_hours',
      'inject_depends_duration_minutes',
    ];
    requiredFields.forEach((field) => {
      if (R.isNil(values[field])) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  const onSubmit = async (data) => {
    if (contractContent) {
      const finalData = {};
      const hasArticles = contractContent.fields
        .map((f) => f.key)
        .includes('articles');
      if (hasArticles && injectDetailsState.articlesIds) {
        finalData.articles = injectDetailsState.articlesIds;
      }
      const hasChallenges = contractContent.fields
        .map((f) => f.key)
        .includes('challenges');
      if (hasChallenges && injectDetailsState.challengesIds) {
        finalData.challenges = injectDetailsState.challengesIds;
      }
      const hasExpectations = contractContent.fields
        .map((f) => f.key)
        .includes('expectations');
      if (hasExpectations && injectDetailsState.expectations) {
        finalData.expectations = injectDetailsState.expectations;
      }
      if (openDetails) {
        contractContent.fields
          .filter(
            (f) => !['teams', 'assets', 'assetgroups', 'articles', 'challenges', 'attachments', 'expectations'].includes(
              f.key,
            ),
          )
          .forEach((field) => {
            if (field.type === 'number') {
              finalData[field.key] = parseInt(data[field.key], 10);
            } else if (
              field.type === 'textarea'
              && field.richText
              && data[field.key]
              && data[field.key].length > 0
            ) {
              finalData[field.key] = data[field.key]
                .replaceAll(
                  '&lt;#list challenges as challenge&gt;',
                  '<#list challenges as challenge>',
                )
                .replaceAll(
                  '&lt;#list articles as article&gt;',
                  '<#list articles as article>',
                )
                .replaceAll('&lt;/#list&gt;', '</#list>');
            } else if (data[field.key] && field.type === 'tuple') {
              if (field.cardinality && field.cardinality === '1') {
                if (finalData[field.key].type === 'attachment') {
                  finalData[field.key] = {
                    key: data[field.key].key,
                    value: `${field.tupleFilePrefix}${data[field.key].value}`,
                  };
                } else {
                  finalData[field.key] = R.dissoc('type', data[field.key]);
                }
              } else {
                finalData[field.key] = data[field.key].map((pair) => {
                  if (pair.type === 'attachment') {
                    return {
                      key: pair.key,
                      value: `${field.tupleFilePrefix}${pair.value}`,
                    };
                  }
                  return R.dissoc('type', pair);
                });
              }
            } else {
              finalData[field.key] = data[field.key];
            }
          });
      }
      const { allTeams, teamsIds, assetIds, assetGroupIds, documents } = injectDetailsState;
      const inject_depends_duration = data.inject_depends_duration_days * 3600 * 24
        + data.inject_depends_duration_hours * 3600
        + data.inject_depends_duration_minutes * 60;
      const inject_tags = !R.isEmpty(data.inject_tags) ? R.pluck('id', data.inject_tags) : [];
      const values = {
        inject_title: data.inject_title,
        inject_injector_contract: contractContent.contract_id,
        inject_description: data.inject_description,
        inject_tags,
        inject_content: isEmptyField(finalData) ? null : finalData,
        inject_all_teams: allTeams,
        inject_teams: teamsIds,
        inject_assets: assetIds,
        inject_asset_groups: assetGroupIds,
        inject_documents: documents,
        inject_depends_duration,
        inject_depends_on: data.inject_depends_on,
      };
      await onUpdateInject(values);
    }
    handleClose();
  };

  const duration = splitDuration(inject?.inject_depends_duration || 0);
  const initialValues = {
    ...inject,
    ...inject?.inject_content,
    inject_tags: tagOptions(inject?.inject_tags, tagsMap),
    inject_depends_duration_days: duration.days,
    inject_depends_duration_hours: duration.hours,
    inject_depends_duration_minutes: duration.minutes,
  };

  // Enrich initialValues with default contract value
  const builtInFields = [
    'teams',
    'assets',
    'assetgroups',
    'articles',
    'challenges',
    'attachments',
    'expectations',
  ];
  if (isEmptyField(inject?.inject_content)) {
    contractContent?.fields
      .filter((f) => !builtInFields.includes(f.key))
      .forEach((field) => {
        if (!initialValues[field.key]) {
          if (field.cardinality && field.cardinality === '1') {
            initialValues[field.key] = R.head(field.defaultValue);
          } else {
            initialValues[field.key] = field.defaultValue;
          }
        }
      });
  }
  // Specific processing for some fields
  contractContent?.fields
    .filter((f) => !builtInFields.includes(f.key))
    .forEach((field) => {
      if (
        field.type === 'textarea'
        && field.richText
        && initialValues[field.key]
        && initialValues[field.key].length > 0
      ) {
        initialValues[field.key] = initialValues[field.key]
          .replaceAll(
            '<#list challenges as challenge>',
            '&lt;#list challenges as challenge&gt;',
          )
          .replaceAll(
            '<#list articles as article>',
            '&lt;#list articles as article&gt;',
          )
          .replaceAll('</#list>', '&lt;/#list&gt;');
      } else if (field.type === 'tuple' && initialValues[field.key]) {
        if (field.cardinality && field.cardinality === '1') {
          if (
            initialValues[field.key].value
            && initialValues[field.key].value.includes(
              `${field.tupleFilePrefix}`,
            )
          ) {
            initialValues[field.key] = {
              type: 'attachment',
              key: initialValues[field.key].key,
              value: initialValues[field.key].value.replace(
                `${field.tupleFilePrefix}`,
                '',
              ),
            };
          } else {
            initialValues[field.key] = R.assoc(
              'type',
              'text',
              initialValues[field.key],
            );
          }
        } else {
          initialValues[field.key] = initialValues[field.key].map((pair) => {
            if (
              pair.value
              && pair.value.includes(`${field.tupleFilePrefix}`)
            ) {
              return {
                type: 'attachment',
                key: pair.key,
                value: pair.value.replace(`${field.tupleFilePrefix}`, ''),
              };
            }
            return R.assoc('type', 'text', pair);
          });
        }
      }
    });
  return (
    <>
      <Card elevation={0} classes={{ root: classes.injectorContract }}>
        <CardHeader
          classes={{ root: classes.injectorContractHeader }}
          avatar={contractContent ? <Avatar sx={{ width: 24, height: 24 }} src={`/api/images/injectors/${contractContent.config.type}`} />
            : <Avatar sx={{ width: 24, height: 24 }}><HelpOutlined /></Avatar>}
          title={contractContent?.contract_attack_patterns_external_ids.join(', ')}
          action={<div style={{ display: 'flex', alignItems: 'center' }}>
            {inject?.inject_injector_contract?.injector_contract_platforms?.map(
              (platform) => <PlatformIcon key={platform} width={20} platform={platform} marginRight={10} />,
            )}
          </div>}
        />
        <CardContent classes={{ root: classes.injectorContractContent }}>
          {tPick(contractContent.label)}
        </CardContent>
      </Card>
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
        mutators={{
          ...arrayMutators,
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ form, handleSubmit, submitting, values, errors }) => {
          return (
            <form id="injectContentForm" onSubmit={handleSubmit} style={{ marginTop: 10 }}>
              <InjectForm form={form} values={values} disabled={!contractContent} isAtomic={isAtomic} />
              {contractContent && (
                <div className={classes.details}>
                  {openDetails && (
                    <InjectDefinition
                      form={form}
                      values={values}
                      submitting={submitting}
                      inject={initialValues}
                      injectorContract={contractContent}
                      handleClose={handleClose}
                      tagsMap={tagsMap}
                      permissions={permissions}
                      teamsFromExerciseOrScenario={teamsFromExerciseOrScenario}
                      articlesFromExerciseOrScenario={[]}
                      variablesFromExerciseOrScenario={[]}
                      onUpdateInject={onUpdateInject}
                      setInjectDetailsState={setInjectDetailsState}
                      uriVariable={''}
                      allUsersNumber={0}
                      usersNumber={0}
                      teamsUsers={[]}
                      isAtomic={isAtomic}
                      {...props}
                    />
                  )}
                  <div className={classes.openDetails} onClick={toggleInjectContent}>
                    {openDetails ? <ArrowDropUpOutlined fontSize="large" /> : <ArrowDropDownOutlined fontSize="large" />}
                    {t('Inject content')}
                  </div>
                </div>
              )}
              <div style={{ float: 'right', marginTop: 20 }}>
                <Button
                  variant="contained"
                  onClick={handleClose}
                  style={{ marginRight: 10 }}
                  disabled={submitting}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  disabled={submitting || Object.keys(errors).length > 0 || !contractContent}
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

export default UpdateInjectDetails;
