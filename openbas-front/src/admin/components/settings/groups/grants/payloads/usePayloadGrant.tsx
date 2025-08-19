import { useEffect } from 'react';

import { fetchGroup } from '../../../../../../actions/Group';
import { type GroupHelper } from '../../../../../../actions/group/group-helper';
import { useFormatter } from '../../../../../../components/i18n';
import { useHelper } from '../../../../../../store';
import { type Payload } from '../../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../../utils/hooks';
import { type TableConfig } from '../ui/TableData';

const usePayloadGrant = (groupId: string) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const group = useHelper((helper: GroupHelper) => helper.getGroup(groupId));

  useEffect(() => {
    dispatch(fetchGroup(groupId));
  }, [dispatch]);

  if (!group) {
    return { configs: [] };
  }

  const configs: TableConfig<Payload>[] = [
    {
      label: t('Payload'),
      value: payload => payload.payload_name,
      width: '40%',
      align: 'left',
    },
  ];

  return { configs };
};

export default usePayloadGrant;
