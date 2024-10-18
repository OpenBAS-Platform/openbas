import { FunctionComponent } from 'react';

import type { ExecutorHelper } from '../actions/executors/executor-helper';
import { useHelper } from '../store';
import type { Executor } from '../utils/api-types';
import { useFormatter } from './i18n';

interface ItemExecutorProps {
  executorId: string | null;
}

const ItemExecutor: FunctionComponent<ItemExecutorProps> = ({
  executorId,
}) => {
  const { t } = useFormatter();
  const { executorsMap }: { executorsMap: Record<string, Executor> } = useHelper((helper: ExecutorHelper) => ({
    executorsMap: helper.getExecutorsMap(),
  }));
  const executor = executorId ? executorsMap[executorId] : null;
  return (
    <>
      {executor && (
        <img
          src={`/api/images/executors/${executor.executor_type}`}
          alt={executor.executor_type}
          style={{ width: 25, height: 25, borderRadius: 4, marginRight: 10 }}
        />
      )}
      {executor?.executor_name ?? t('Unknown')}
    </>
  );
};

export default ItemExecutor;
