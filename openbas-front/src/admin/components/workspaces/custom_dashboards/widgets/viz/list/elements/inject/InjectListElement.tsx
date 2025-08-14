import { Description } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import TagsFragment from '../../../../../../../../../components/common/list/fragments/TagsFragment';
import useBodyItemsStyles from '../../../../../../../../../components/common/queryable/style/style';
import { useFormatter } from '../../../../../../../../../components/i18n';
import ItemStatus from '../../../../../../../../../components/ItemStatus';
import PlatformIcon from '../../../../../../../../../components/PlatformIcon';
import {
  type EsInject,
  type EsScenario,
  type EsSimulation,
} from '../../../../../../../../../utils/api-types';
import buildStyles from '../ColumnStyles';
import InjectElementStyles from './InjectElementStyles';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

type Props = {
  columns: string[];
  element: EsInject | EsSimulation | EsScenario;
};
const InjectListElement = (props: Props) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const { t } = useFormatter();
  const bodyItemsStyles = useBodyItemsStyles();

  /* eslint-disable react/display-name */
  // eslint doesn't seem to be able to infer the display names of subcomponents but react can
  const elementsFromColumn = (column: string) => {
    switch (column) {
      case 'base_tags_side':
        return (esElement: EsInject | EsScenario | EsSimulation) => <TagsFragment tags={esElement.base_tags_side ?? []} />;
      case 'status':
      case 'inject_status':
        return (esElement: EsInject | EsScenario | EsSimulation) => {
          const isInject = esElement.base_entity === 'inject';
          const status = isInject ? esElement.inject_status : esElement.status;
          return (<ItemStatus isInject={isInject} status={status} label={t(status || '-')} variant="inList" />);
        };
      case 'base_platforms_side_denormalized':
        return (esElement: EsInject | EsScenario | EsSimulation) => {
          return esElement.base_platforms_side_denormalized?.map(
            (platform: string) => <PlatformIcon key={platform} platform={platform} tooltip width={20} marginRight={theme.spacing(1)} />,
          );
        };
      default: return (esElement: EsInject | EsScenario | EsSimulation) => {
        const key = column as keyof typeof esElement;
        const text = esElement[key]?.toString() || '';
        return (
          <Tooltip title={text} placement="bottom-start">
            <span>{text}</span>
          </Tooltip>
        );
      };
    }
  };
    /* eslint-enable react/display-name */

  return (
  // TODO #3524 see EndpointListElement
    <ListItemButton classes={{ root: classes.item }} inert={true}>
      <ListItemIcon>
        <Description color="primary" />
      </ListItemIcon>
      <ListItemText
        primary={(
          <div style={bodyItemsStyles.bodyItems}>
            {props.columns.map(col => (
              <div
                key={col}
                style={{
                  ...bodyItemsStyles.bodyItem,
                  ...buildStyles(props.columns, InjectElementStyles)[col],
                }}
              >
                {elementsFromColumn(col)(props.element)}
              </div>
            ))}
          </div>
        )}
      />
    </ListItemButton>
  );
};

export default InjectListElement;
