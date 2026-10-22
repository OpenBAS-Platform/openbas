import { Tooltip, TooltipContent, TooltipTrigger } from '@filigran/design-system';

import { useExecutorsMap } from '../../../../../actions/executors/executor-queries';
import { useFormatter } from '../../../../../components/i18n';
import { type EndpointOutput } from '../../../../../utils/api-types';
import { getExecutorsCount } from '../../../../../utils/endpoints/utils';
import { buildTenantApiPath } from '../../../../../utils/url-helper';

type Props = { endpoint: EndpointOutput };

const EndpointActiveFragment = (props: Props) => {
  // One shared query: this fragment renders per row, and every row reads the same cached
  // executors (it must never fetch them per endpoint).
  const executorsMap = useExecutorsMap();
  const { t } = useFormatter();
  if ((props.endpoint.asset_agents ?? []).length <= 0) {
    return <span>-</span>;
  }

  const groupedExecutors = getExecutorsCount(props.endpoint, executorsMap);
  if (!groupedExecutors) {
    return '-';
  }

  return (
    <>
      {
        Object.keys(groupedExecutors).map((executorType) => {
          const executorsOfType = groupedExecutors[executorType];
          const count = executorsOfType.length;
          const base = executorsOfType[0];

          if (count > 0) {
            return (
              <Tooltip key={executorType}>
                <TooltipTrigger asChild>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  >
                    <img
                      src={buildTenantApiPath(`/api/images/executors/icons/${executorType}`)}
                      alt={executorType}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        marginRight: 10,
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>{`${base.executor_name} : ${count}`}</TooltipContent>
              </Tooltip>
            );
          } else {
            return t('Unknown');
          }
        })
      }
    </>
  );
};

export default EndpointActiveFragment;
