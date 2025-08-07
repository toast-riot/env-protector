import { JSDOM } from 'jsdom'
import * as vscode from 'vscode'

export function getMaskedView(
  context: vscode.ExtensionContext,
  webviewPanel: vscode.WebviewPanel
): string {
  const dom = new JSDOM()
  const htmlDocument = dom.window.document

  const scriptPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'media', 'main.js')
  
  const p = htmlDocument.createElement('p')
  p.textContent = 'Document masked.'
  htmlDocument.body.appendChild(p)
  
  const a = htmlDocument.createElement('a')
  a.href = '#'
  a.id = 'unmask-link'
  a.textContent = 'Open File Anyway'
  htmlDocument.body.appendChild(a)

  const script = htmlDocument.createElement('script')
  script.src = webviewPanel.webview.asWebviewUri(scriptPath).toString()
  htmlDocument.body.appendChild(script)

  return htmlDocument.documentElement.outerHTML
}
