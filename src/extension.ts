import * as vscode from 'vscode'
import { getMaskedView } from './utils/get-masked-view'
import { name } from '.././package.json'
import { addEnvVariable } from './commands/add-env-variable'
import { editEnvVariable } from './commands/edit-env-variable'
import { removeEnvVariable } from './commands/remove-env-variable'


export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerCustomEditorProvider(
    `${name}.envFileEditor`,
    {
      async resolveCustomTextEditor(document, webviewPanel) {
        webviewPanel.webview.options = {enableScripts: true}
        webviewPanel.webview.html = getMaskedView(context, webviewPanel)
        webviewPanel.webview.onDidReceiveMessage(async (message) => {
          if (message.command === 'unmaskFile') {
            await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default')
            webviewPanel.dispose()
          }
        })
      },
    },
  )

  context.subscriptions.push(
    addEnvVariable,
    editEnvVariable,
    removeEnvVariable,
  )
}

export function deactivate() {}
