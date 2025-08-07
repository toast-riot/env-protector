import * as vscode from 'vscode'

export async function selectEnvFile(): Promise<vscode.Uri | undefined> {
  const envFiles = await vscode.workspace.findFiles('**/*.env*')
  if (!envFiles.length) {
    vscode.window.showErrorMessage('No .env file found in the workspace')
    return undefined
  }

  return new Promise((resolve) => {
    const quickPick = vscode.window.createQuickPick()
    quickPick.items = envFiles.map((file) => ({ label: file.fsPath }))
    quickPick.title = 'Select an .env file'
    quickPick.show()

    quickPick.onDidAccept(() => {
      const selectedItem = quickPick.selectedItems[0]
      quickPick.hide()
      if (!selectedItem) {
        vscode.window.showErrorMessage('No file selected')
        resolve(undefined)
      } else {
        resolve(vscode.Uri.file(selectedItem.label))
      }
    })
    quickPick.onDidHide(() => {
      resolve(undefined)
    })
  })
}
