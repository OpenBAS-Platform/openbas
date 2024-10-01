import type { InjectDependency } from '../../../../../utils/api-types';

const fromInjectDependencyToInputDependency = (dependencies: InjectDependency[]) => {
  const result : Record<string, string> = {};
  for (let i = 0; i < dependencies.length; i += 1) {
    if (dependencies[i].dependency_relationship?.inject_parent_id !== undefined
        && dependencies[i].dependency_condition !== undefined) {
      const key = dependencies[i].dependency_relationship!.inject_parent_id;
      if (key !== undefined) {
        result[key] = dependencies[i].dependency_condition!;
      }
    }
  }
  return dependencies.length > 0 ? result : null;
};

export default fromInjectDependencyToInputDependency;
