import pkg from '../package.json' with { type: 'json' };
import classesRule from './rules/classes-rule.ts';
import noMutableExports from './rules/no-mutable-exports.ts';

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules: {
    'classes-rule': classesRule,
    'no-mutable-exports': noMutableExports,
  },
};

// Assigned onto `plugin` so that the config refers to the very object it is exported as
export default Object.assign(plugin, {
  configs: {
    recommended: {
      name: 'custom-rules/recommended',
      plugins: { 'custom-rules': plugin },
      rules: {
        'custom-rules/classes-rule': 'error',
        'custom-rules/no-mutable-exports': 'error',
      },
    },
  },
});
