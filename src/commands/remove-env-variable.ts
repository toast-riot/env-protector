import * as vscode from 'vscode'
import { name } from '../../package.json'
import fs from 'fs'
import { selectEnvFile } from '../utils/select-env-file'

export const removeEnvVariable = vscode.commands.registerCommand(
  `${name}.remove-env-variable`,
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
    variableQuickPick.title = 'Select variables to remove'
    variableQuickPick.placeholder = 'Select variables to remove'
    variableQuickPick.ignoreFocusOut = true
    variableQuickPick.canSelectMany = true
    variableQuickPick.show()

    variableQuickPick.onDidAccept(async () => {
      const selectedVariables = variableQuickPick.selectedItems
      if (!selectedVariables.length) {
        return vscode.window.showErrorMessage('No variables selected')
      }
      variableQuickPick.hide()

      // Remove selected variables from the file content
      const selectedVariableNames = selectedVariables.map(
        (item) => item.label,
      )
      const newLines = lines.filter((line) => {
        const variableName = line.split('=')[0]
        return !selectedVariableNames.includes(variableName)
      })

      // Write the updated content back to the file
      fs.writeFileSync(fileUri.fsPath, newLines.join('\n'))
      vscode.window.showInformationMessage(
        `Removed selected variables from ${fileUri.fsPath}`,
      )
    })
  },
)
