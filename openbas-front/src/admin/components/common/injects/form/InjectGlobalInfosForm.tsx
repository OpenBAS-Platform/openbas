import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../../components/i18n';
import InjectContentFieldComponent, { type InjectField } from './InjectContentFieldComponent';

const useStyles = makeStyles()(theme => ({
  triggerBox: {
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    textWrap: 'nowrap',
    gap: theme.spacing(3),
  },
  triggerBoxColor: { border: `1px solid ${theme.palette.primary.main}` },
  triggerBoxColorDisabled: { border: `1px solid ${theme.palette.action.disabled}` },
  triggerText: {
    fontFamily: 'Consolas, monaco, monospace',
    fontSize: 12,
  },
  triggerTextColor: { color: theme.palette.primary.main },
  triggerTextColorDisabled: { color: theme.palette.action.disabled },
}));

interface Props {
  readOnly: boolean;
  isAtomic: boolean;
}

const InjectGlobalInfosForm = ({ readOnly, isAtomic }: Props) => {
  const { t } = useFormatter();
  const { classes } = useStyles();

  const fields: InjectField[] = [
    {
      key: 'inject_title',
      type: 'text',
      label: t('Title'),
    },
    {
      key: 'inject_description',
      type: 'textarea',
      label: t('Description'),
      settings: { rows: 2 },
    },
    {
      key: 'inject_tags',
      type: 'tags',
      label: t('Tags'),
    },
  ];

  const dependsDurationFields: InjectField[] = [
    {
      key: 'inject_depends_duration_days',
      type: 'number',
      label: t('Days'),
    }, {
      key: 'inject_depends_duration_hours',
      type: 'number',
      label: t('Hours'),
    }, {
      key: 'inject_depends_duration_minutes',
      type: 'number',
      label: t('Minutes'),
    },

  ];

  const renderField = (field: InjectField) => (
    <InjectContentFieldComponent
      key={field.key}
      field={field}
      readOnly={readOnly}
    />
  );

  return (
    <>
      {fields.map(field => renderField(field))}
      {!isAtomic && (
        <div className={`${classes.triggerBox} ${readOnly ? classes.triggerBoxColorDisabled : classes.triggerBoxColor}`}>
          <div className={`${classes.triggerText} ${readOnly ? classes.triggerTextColorDisabled : classes.triggerTextColor}`}>{t('Trigger after')}</div>
          {dependsDurationFields.map(field => renderField(field))}
        </div>
      )}
    </>
  );
};

export default InjectGlobalInfosForm;
