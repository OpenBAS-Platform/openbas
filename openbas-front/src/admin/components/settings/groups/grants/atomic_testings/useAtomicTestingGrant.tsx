import { useEffect } from 'react';

import { fetchGroup } from '../../../../../../actions/Group';
import { type GroupHelper } from '../../../../../../actions/group/group-helper';
import { useFormatter } from '../../../../../../components/i18n';
import { useHelper } from '../../../../../../store';
import { type InjectResultOutput } from '../../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../../utils/hooks';
import { type TableConfig } from '../ui/TableData';

const useAtomicTestingGrant = (groupId: string) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const group = useHelper((helper: GroupHelper) => helper.getGroup(groupId));

  useEffect(() => {
    dispatch(fetchGroup(groupId));
  }, [dispatch]);

  if (!group) {
    return { configs: [] };
  }

  const configs: TableConfig<InjectResultOutput>[] = [
    {
      label: t('Atomic testing'),
      value: inject => inject.inject_title,
      width: '40%',
      align: 'left',
    },
  ];

  return { configs };
};

export default useAtomicTestingGrant;
