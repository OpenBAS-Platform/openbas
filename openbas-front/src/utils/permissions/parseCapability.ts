import { ACTIONS, type Actions, SUBJECTS, type Subjects } from './types';

export default function parseCapability(cap: string): [Actions, Subjects] | null {
  const parts = cap.split('_');
  if (parts.length < 2) return null;

  // For example if we take "ACCESS_ATOMIC_TESTING" the first word is the action, the followings are the subject
  const action = parts[0] as Actions;
  const subject = parts.slice(1).join('_');

  // To avoid any mistake : check that the action or subject is one of those declared in the types.ts file
  if (!ACTIONS.includes(action)) return null;
  if (!SUBJECTS.includes(subject as Subjects)) return null;

  return [action, subject as Subjects];
}
