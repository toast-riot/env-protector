import * as vscode from 'vscode'
import { name } from '../../package.json'
import fs from 'fs'
import { selectEnvFile } from '../utils/select-env-file'

export const addEnvVariable = vscode.commands.registerCommand(
  `${name}.add-env-variable`,
  async () => {
    const fileUri = await selectEnvFile()
    if (!fileUri) return

    // Prompt user to enter the variable name
    const variableName = await vscode.window.showInputBox({
      prompt: 'Enter the variable name',
      ignoreFocusOut: true,
    })
    if (!variableName) return

    // Prompt user to enter the variable value
    const variableValue = await vscode.window.showInputBox({
      prompt: 'Enter the variable value',
      ignoreFocusOut: true,
      password: true,
    })
    if (!variableValue) return

    // Prompt user to add a comment line for the variable
    const comment = await vscode.window.showInputBox({
      prompt: 'Enter a comment for the variable',
      ignoreFocusOut: true,
      placeHolder: "Leave empty if you don't want to add comment.",
    })

    // Write the variable to the file
    const text = `${variableName}=${variableValue} ${comment ? `# ${comment}` : ''}\n`
    const fileContent = fs.readFileSync(fileUri.fsPath, 'utf-8')

    fileContent.split('\n').forEach((line) => {
      if (line.trim().startsWith(variableName)) {
        return vscode.window.showErrorMessage(`Variable ${variableName} already exists in ${fileUri.fsPath}`)
      }
    })

    // If the content's last line is not empty, add a new line
    if (fileContent.trim().slice(-1) !== '') {
      fs.appendFileSync(fileUri.fsPath, '\n')
    }

    // Write the variable to the file
    fs.appendFileSync(fileUri.fsPath, text)
    vscode.window.showInformationMessage(`Added ${variableName} to ${fileUri.fsPath}`)
  },
)
