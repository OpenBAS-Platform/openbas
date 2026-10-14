// Importers get a live binding to an exported `let`/`var`, so a module that reassigns
// it changes values under their feet. Exported bindings must be `const`.

const MUTABLE_KINDS = new Set(["let", "var"]);

const findVariable = (scope, name) => {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);
    if (variable) {
      return variable;
    }
  }
  return null;
};

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Forbid exporting mutable (`let` or `var`) bindings",
    },
    messages: {
      mutable: "Exporting mutable '{{kind}}' binding, use 'const' instead.",
    },
    schema: [],
  },
  create: (context) => {
    const sourceCode = context.sourceCode;
    // `let a, b; export { a, b };` reports the declaration once
    const reported = new Set();

    const reportDeclaration = (declaration) => {
      if (declaration.type === "VariableDeclaration" && MUTABLE_KINDS.has(declaration.kind) && !reported.has(declaration)) {
        reported.add(declaration);
        context.report({ node: declaration, messageId: "mutable", data: { kind: declaration.kind } });
      }
    };

    const checkLocalBinding = (node, identifier) => {
      const variable = findVariable(sourceCode.getScope(node), identifier.name);
      if (!variable) {
        return;
      }
      variable.defs.forEach((def) => {
        if (def.type === "Variable" && def.parent) {
          reportDeclaration(def.parent);
        }
      });
    };

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          reportDeclaration(node.declaration);
          return;
        }
        // `export { x } from '...'` re-exports another module's binding
        if (node.source || node.exportKind === "type") {
          return;
        }
        node.specifiers.forEach((specifier) => {
          if (specifier.exportKind !== "type" && specifier.local.type === "Identifier") {
            checkLocalBinding(node, specifier.local);
          }
        });
      },
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === "Identifier") {
          checkLocalBinding(node, node.declaration);
        }
      },
    };
  },
};
