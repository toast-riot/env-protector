const vscode = acquireVsCodeApi();
document.getElementById('unmask-link').addEventListener('click', () => {
    vscode.postMessage({ command: 'unmaskFile' });
});