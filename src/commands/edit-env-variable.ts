import * as vscode from 'vscode'
import { name } from '../../package.json'
import fs from 'fs'
import { selectEnvFile } from '../utils/select-env-file'

export const editEnvVariable = vscode.commands.registerCommand(
  `${name}.edit-env-variable`,
  async () => {
    const fileUri = await selectEnvFile()
    if (!fileUri) return

    // Read the file content
    const fileContent = fs.readFileSync(fileUri.fsPath, 'utf-8')
    const lines = fileContent.split('\n')

    // Extract variables from the file
    const variables = lines
      .filter((line) => line.includes('='))
      .map((line) => line.split('=')[0])

    if (!variables.length) {
      return vscode.window.showErrorMessage(
        `No variables found in ${fileUri.fsPath}`,
      )
    }

    // Prompt the user to select variables to remove
    const variableQuickPick = vscode.window.createQuickPick()
    variableQuickPick.items = variables.map((variable) => ({
      label: variable,
    }))
    variableQuickPick.title = 'Select variable to edit'
    variableQuickPick.placeholder = 'Select variable to edit'
    variableQuickPick.ignoreFocusOut = true
    variableQuickPick.canSelectMany = false
    variableQuickPick.show()

    variableQuickPick.onDidAccept(async () => {
      const [selectedVariable] = variableQuickPick.selectedItems
      if (!selectedVariable) {
        return vscode.window.showErrorMessage('No variable selected')
      }
      variableQuickPick.hide()

      // Prompt user to enter the variable value
      const variableValue = await vscode.window.showInputBox({
        prompt: 'Enter the variable value',
        ignoreFocusOut: true,
        password: true, // Mask the input
      })
      if (!variableValue) {
        return vscode.window.showErrorMessage('No variable value entered')
      }

      // Edit selected variables from the file content
      const selectedVariableName = selectedVariable.label
      const newLines = lines.map((line) => {
        if (line.includes(selectedVariableName)) {
          // Replace the variable value without overriding the comment
          const comment = line.split('#')[1]
          return `${selectedVariableName}=${variableValue} ${
            comment ? `#${comment}` : ''
          }`
        }
        return line
      })

      // Write the updated content back to the file
      fs.writeFileSync(fileUri.fsPath, newLines.join('\n'))
      vscode.window.showInformationMessage(
        `Modified '${selectedVariableName}' from ${fileUri.fsPath}`,
      )
    })
  },
)
