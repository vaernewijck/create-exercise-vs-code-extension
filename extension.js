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

	try {
		// First ask for target directory
		const targetDirectory = await selectTargetDirectory(workspaceFolders[0].uri);
		if (!targetDirectory) {
			return; // User cancelled
		}

		// Then ask for project name
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
			return; // User cancelled
		}

		await fileGenerator.generateFiles(targetDirectory.fsPath, projectName);
		vscode.window.showInformationMessage(`Project "${projectName}" created successfully!`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error creating project: ${error.message}`);
	}
}

async function selectTargetDirectory(defaultUri) {
	const options = {
		canSelectFiles: false,
		canSelectFolders: true,
		canSelectMany: false,
		openLabel: 'Select Target Directory',
		defaultUri
	};

	const targetDirs = await vscode.window.showOpenDialog(options);
	if (targetDirs && targetDirs.length > 0) {
		return targetDirs[0];
	}

	return null;
};

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
