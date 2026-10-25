export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain;charset=utf-8'
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJsonReport(jsonData: Record<string, any>, analysisId: string) {
  const content = JSON.stringify(jsonData, null, 2);
  const filename = `TerraWatch_Report_${analysisId}.json`;
  downloadFile(content, filename, 'application/json');
}

export function downloadMarkdownReport(markdownContent: string, analysisId: string) {
  const filename = `TerraWatch_Report_${analysisId}.md`;
  downloadFile(markdownContent, filename, 'text/markdown;charset=utf-8');
}
