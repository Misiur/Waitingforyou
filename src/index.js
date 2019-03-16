const acorn = require('acorn');
const walk = require('acorn-walk');
const escodegen = require('escodegen');
const fs = require('fs');
const { promisify } = require('util');
const { join } = require('path');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function main() {
  const buffer = await readFile(join(__dirname, 'example.js'));
  const content = buffer.toString('utf-8');
  const tree = acorn.parse(content);

  walk.fullAncestor(tree, (node, ancestors) => {
    if (node.type === 'Program') return;
    const parent = ancestors[ancestors.length - 2];
    if ((node.type === 'CallExpression' || node.type === 'MemberExpression') && parent.type !== 'AwaitExpression') {
      const item = {
        type: 'AwaitExpression',
        argument: node,
      };

      if (parent.type === 'ExpressionStatement') {
        parent.expression = item;
      } else if (parent.type === 'ArrowFunctionExpression') {
        parent.body = item;
      } else if (parent.type === 'VariableDeclarator') {
        parent.init = item;
      } else if (parent.type === 'TemplateLiteral') {
        parent.expressions.splice(parent.expressions.indexOf(node), 1, item);
      }
    }

    if (node.type.indexOf('Function') !== -1) {
      node.async = true;
    }
  });

  const towrite = escodegen.generate(tree);
  await writeFile(join(__dirname, '..', 'output', 'output.js'), towrite);
}

main();