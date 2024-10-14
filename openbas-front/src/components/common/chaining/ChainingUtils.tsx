import type { InjectDependency } from '../../../utils/api-types';

const breakpointAndOr = /(&&|\|\|)/gm;
const breakpointValue = /==/gm;
const typeFromName = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.*)-Success/mg;

const fromInjectDependencyToInputDependency = (dependencies: InjectDependency[]) => {
  const result : Record<string, string> = {};
  for (let i = 0; i < dependencies.length; i += 1) {
    if (dependencies[i].dependency_relationship?.inject_parent_id !== undefined
        && dependencies[i].dependency_condition !== undefined) {
      const key = dependencies[i].dependency_relationship!.inject_parent_id;
      if (key !== undefined) {
        result[key as unknown as string] = dependencies[i].dependency_condition!;
      }
    }
  }
  return dependencies.length > 0 ? result : null;
};

const fromInjectDependencyToLabel = (dependency: string) => {
  let label = '';
  const splittedConditions = dependency.split(breakpointAndOr);
  for (let i = 0; i < splittedConditions.length; i += 1) {
    if (splittedConditions[i].trim() === '&&') {
      label += ' AND ';
    } else if (splittedConditions[i].trim() === '||') {
      label += ' OR ';
    } else {
      const splittedValues = splittedConditions[i].trim().split(breakpointValue);
      const key = Array.from(splittedValues[0].trim().matchAll(typeFromName), (m) => m[1]);
      label += `${key} is ${splittedValues[1].trim() === 'true' ? 'Success' : 'Failure'}`;
    }
  }

  return label;
};

export default { fromInjectDependencyToInputDependency, fromInjectDependencyToLabel };
