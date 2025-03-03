const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const generateFiles = async (rootPath, projectName) => {
  const extensionPath = vscode.extensions.getExtension('publisher.starter-files-generator')?.extensionPath
    || path.join(__dirname, '..');

  try {
    // Create project directory
    const projectPath = path.join(rootPath, projectName);
    await createDirectory(projectPath);

    // Create subdirectories
    await createDirectory(path.join(projectPath, 'css'));
    await createDirectory(path.join(projectPath, 'js'));

    // Read template files
    let htmlTemplate = await readTemplateFile(extensionPath, 'html-template.html');
    const cssTemplate = await readTemplateFile(extensionPath, 'css-template.css');
    const resetTemplate = await readTemplateFile(extensionPath, 'reset-template.css');
    const jsTemplate = await readTemplateFile(extensionPath, 'js-template.js');

    // Replace the title in the HTML template
    htmlTemplate = htmlTemplate.replace(/<title>Document<\/title>/g, `<title>${projectName}</title>`);
    htmlTemplate = htmlTemplate.replace(/<h1>My Project<\/h1>/g, `<h1>${projectName}</h1>`);

    // Create files
    await createFile(path.join(projectPath, 'index.html'), htmlTemplate);
    await createFile(path.join(projectPath, 'css', 'style.css'), cssTemplate);
    await createFile(path.join(projectPath, 'css', 'reset.css'), resetTemplate);
    await createFile(path.join(projectPath, 'js', 'script.js'), jsTemplate);

  } catch (error) {
    throw new Error(`Failed to generate files: ${error.message}`);
  }
};

const readTemplateFile = async (extensionPath, templateFileName) => {
  return new Promise((resolve, reject) => {
    const templatePath = path.join(extensionPath, 'templates', templateFileName);
    fs.readFile(templatePath, 'utf8', (err, content) => {
      if (err) {
        reject(new Error(`Failed to read template file ${templateFileName}: ${err.message}`));
        return;
      }
      resolve(content);
    });
  });
};

const createDirectory = (dirPath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dirPath)) {
      resolve();
      return;
    }

    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

const createFile = (filePath, content) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      const basename = path.basename(filePath);
      vscode.window.showWarningMessage(
        `File ${basename} already exists. Overwrite?`,
        'Yes', 'No'
      ).then(response => {
        if (response !== 'Yes') {
          resolve();
          return;
        }
        writeFile(filePath, content, resolve, reject);
      });
    } else {
      writeFile(filePath, content, resolve, reject);
    }
  });
};

const writeFile = (filePath, content, resolve, reject) => {
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve();
  });
};

module.exports = {
  generateFiles
};