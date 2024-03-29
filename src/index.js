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
    if (node.type === 'CallExpression' && parent.type !== 'AwaitExpression') {
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
      } else if (parent.type === 'MemberExpression') {
        if (parent.property === node) parent.property = item;
        else if (parent.object === node) parent.object = item;
      } else if (parent.type === 'AssignmentExpression') {
        parent.right = item;
      } else if (parent.type === 'CallExpression') {
        parent.arguments.splice(parent.arguments.indexOf(node), 1, item);
      } else if (parent.type === 'TemplateLiteral') {
        parent.expressions.splice(parent.expressions.indexOf(node), 1, item);
      } else if (parent.type === 'ForOfStatement') {
        // It will never be the left node
        parent.right = item;
      } else if (parent.type === 'UnaryExpression') {
        parent.argument = item
      } else if (parent.type === 'LogicalExpression') {
        if (parent.left === node) parent.left = item
        if (parent.right === node) parent.right = item
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