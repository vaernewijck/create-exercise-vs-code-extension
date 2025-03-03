const vscode = require('vscode');
const fileGenerator = require('./src/file-generator');


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand('starter-files-generator.createStarterFiles', createStarterFiles);
	context.subscriptions.push(disposable);
}

async function createStarterFiles() {
	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (!workspaceFolders) {
		vscode.window.showErrorMessage('Please open a workspace first');
		return;
	}

	// make sure to go to the root of the workspace
	vscode.workspace.updateWorkspaceFolders(0, workspaceFolders.length, { uri: workspaceFolders[0].uri });

	// get the root path
	const rootPath = workspaceFolders[0].uri.fsPath;

	// Ask for the project name
	const projectName = await vscode.window.showInputBox({
		prompt: 'Enter project name',
		placeHolder: 'my-project',
		validateInput: (value) => {
			if (!value || value.trim() === '') {
				return 'Project name cannot be empty';
			}
			if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
				return 'Project name can only contain letters, numbers, hyphens, and underscores';
			}
			return null;
		}
	});

	if (!projectName) {
		vscode.window.showErrorMessage('Project name is required');
		return;
	}

	try {
		await fileGenerator.generateFiles(rootPath, projectName);
		vscode.window.showInformationMessage('Starter files created successfully!');
	} catch (error) {
		vscode.window.showErrorMessage(`Error creating starter files: ${error.message}`);
	}
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
