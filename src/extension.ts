import * as vscode from 'vscode'
import { getMaskedView } from './utils/get-masked-view'
import { name } from '.././package.json'
import { addEnvVariable } from './commands/add-env-variable'
import { maskEnvValues } from './commands/mask-env-values'
import { showEnvFiles } from './commands/show-env-files'
import { hideEnvFiles } from './commands/hide-env-files'
import { editEnvVariable } from './commands/edit-env-variable'
import { removeEnvVariable } from './commands/remove-env-variable'

export function activate(context: vscode.ExtensionContext) {
  console.log('Activated')
  
  vscode.window.registerCustomEditorProvider(`${name}.envFileEditor`, {
    async resolveCustomTextEditor(document, webviewPanel) {

      const text = document.getText()
      webviewPanel.webview.html = getMaskedView(text, context, webviewPanel)
      webviewPanel.webview.options = {
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'src', 'css')],
      }
    }
  },
  {
    webviewOptions: { retainContextWhenHidden: true }
  })
  
  context.subscriptions.push(
    showEnvFiles,
    maskEnvValues,
    hideEnvFiles,
    addEnvVariable,
    editEnvVariable,
    removeEnvVariable,
  )
}

export function deactivate() {
  console.log('Deactivated')
}
