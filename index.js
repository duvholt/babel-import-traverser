const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const path = require("path");

const { resolvePath } = require('babel-plugin-module-resolver');

const moduleResolvePath = (sourcePath, currentFile) =>
  resolvePath(sourcePath, currentFile, {
    root: ["./src"],
    alias: {
      test: "./test",
      module2: "./module2",
      underscore: "lodash"
    }
  });

const readFileAndParse = (file) => {
  fs.readFile(file, (err, data) => {
    if(err) {
      throw err;
    }
    
    traverseForImports(file, data.toString());
  });
}

const relativeResolvePath = (current, importPath) => {
  const realPath = moduleResolvePath(importPath, current);
  const resolvedPath = path.resolve(path.dirname(current), realPath);
  console.log(`Resolved ${resolvedPath}`);
  readFileAndParse(resolvedPath);
};

function traverseForImports(current, code) {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: [
      "typescript"
    ]
  });

  traverse(ast, {
    enter(pathy) {
      // ES module
      if (pathy.isImportDeclaration()) {
        relativeResolvePath(current, pathy.node.source.value);
      }
      // commonjs require
      if (pathy.isCallExpression() && pathy.node.callee.name === 'require') {
        relativeResolvePath(current, pathy.node.arguments[0].value);
      }
    }
  })
}


readFileAndParse("./module1/index.ts");
