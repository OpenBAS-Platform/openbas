import { ACTIONS, type Actions, SUBJECTS, type Subjects } from './types';

export default function parseCapability(cap: string): [Actions, Subjects] | null {
  const parts = cap.split('_');
  if (parts.length < 2) return null;

  const action = parts[0] as Actions;
  const subject = parts.slice(1).join('_');

  if (!ACTIONS.includes(action)) return null;
  if (!SUBJECTS.includes(subject as Subjects)) return null;

  return [action, subject as Subjects];
}
