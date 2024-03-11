import type { Inject } from '../../utils/api-types';

export type InjectInput = {
  inject_contract: { id: string, type: string };
  inject_tags: string[]
  inject_depends_duration_days: number;
  inject_depends_duration_hours: number;
  inject_depends_duration_minutes: number;
  inject_depends_duration_seconds: number;
};

export type InjectStore = Omit<Inject, 'inject_tags'> & {
  inject_tags: string[] | undefined;
};
