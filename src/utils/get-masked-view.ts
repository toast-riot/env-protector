import { JSDOM } from 'jsdom'
import * as vscode from 'vscode'

function getMaskedValue(value: string): string {
  return '*******'
}

function parseEnv(content: string) {
  const match = content.match(
    /\s*(?:([\w.-]+)\s*(=)\s*(?:(['"])((?:\\.|(?!\3).)*?)\3|([^\#\n\r]*)))?\s*(?:#(.*))?/
  );

  if (!match) return null
  const key = match[1]
  const equalSign = match[2]
  const quoteType = match[3]
  const value = match[4] ?? match[5]
  const comment = match[6]
  return { key, value, comment, equalSign, quoteType }
}

/**
 * Generates an HTML view with masked values from a given text and a name.
 *
 * @param text - The input text containing key-value pairs, typically from a .env file.
 * @param context - The extension context providing extensionUri.
 * @param webviewPanel - The webview panel to resolve resource URIs.
 * @returns The generated HTML string with masked values.
 *
 * The function creates an HTML document with a paragraph indicating the values are masked,
 * followed by a preformatted block containing the masked key-value pairs. If the input text
 * is empty, it indicates that no content was found in the .env file.
 */
export function getMaskedView(
  text: string,
  context: vscode.ExtensionContext,
  webviewPanel: vscode.WebviewPanel
): string {
  const dom = new JSDOM()
  const htmlDocument = dom.window.document

  const cssPath = vscode.Uri.joinPath(context.extensionUri, 'src' ,'css', 'masked_view.css');
  const cssUri = webviewPanel.webview.asWebviewUri(cssPath);

  const stylesheetLink = htmlDocument.createElement('link')
  stylesheetLink.rel = 'stylesheet'
  stylesheetLink.type = 'text/css'
  stylesheetLink.href = cssUri.toString()
  htmlDocument.head.appendChild(stylesheetLink)

  const pre = htmlDocument.createElement('pre')

  // if (text.length === 0) {
  //   const code = htmlDocument.createElement('code')
  //   code.textContent = 'No content found in the .env file'
  //   pre.appendChild(code)
  //   htmlDocument.body.appendChild(pre)
  //   return htmlDocument.documentElement.outerHTML
  // }

  const lines = text.split('\n')
  for (const line of lines) {

    if (line.trim() === '') {
      console.warn('Skipping blank line:', line)
      continue
    }

    const parsed = parseEnv(line)
    if (!parsed) continue
    const { key, value, comment, equalSign, quoteType } = parsed

    // if (Object.values(parsed).every(v => v === undefined)) {
    //   console.warn('blank line', line)
    //   continue
    // }

    // console.log('Parsed line:', parsed)

    // line
    const lineDiv = htmlDocument.createElement('div')
    lineDiv.className = 'line'

    // key
    if (key !== undefined) {
      const keySpan = htmlDocument.createElement('span')
      keySpan.textContent = key
      lineDiv.appendChild(keySpan)
    }

    // equals
    if (equalSign !== undefined) {
      const equalSignSpan = htmlDocument.createElement('span')
      equalSignSpan.className = 'token-operator'
      equalSignSpan.textContent = equalSign
      lineDiv.appendChild(equalSignSpan)
    }

    // quotes
    if (quoteType !== undefined) {
      const quoteSpan = htmlDocument.createElement('span')
      quoteSpan.className = 'token-operator'
      quoteSpan.textContent = quoteType
      lineDiv.appendChild(quoteSpan)
    }

    // value
    if (value !== undefined) {
      const valueSpan = htmlDocument.createElement('span')
      valueSpan.textContent = getMaskedValue(value)
      lineDiv.appendChild(valueSpan)
    }

    if (quoteType !== undefined) { // TODO: prevent code re-use
      const quoteSpan2 = htmlDocument.createElement('span')
      quoteSpan2.className = 'token-operator'
      quoteSpan2.textContent = quoteType
      lineDiv.appendChild(quoteSpan2)
    }

    if (comment !== undefined) {
      const commentSpan = htmlDocument.createElement('span')
      commentSpan.className = 'token-comment'
      commentSpan.textContent = `${value ? ' ' : ''}#${comment}`
      lineDiv.appendChild(commentSpan)
    }

    pre.appendChild(lineDiv)
  }
  htmlDocument.body.appendChild(pre)
  return htmlDocument.documentElement.outerHTML
}
