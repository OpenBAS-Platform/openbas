// @ts-ignore
import pdfMake from 'pdfmake';

type PdfMakeText = pdfMake.Content;

const parseMarkdownLine = (line: string): PdfMakeText[] => {
  const tokens: PdfMakeText[] = [];

  // Corrected regex to match bold, strikethrough, italic,link and codeSnippet
  const regex = /\*\*([^*]+)\*\*|~~([^~]+)~~|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;
  let lastIndex = 0;

  line.replace(regex, (match, boldText, strikethroughText, italicText, linkText, linkUrl, codeText, offset) => {
    if (lastIndex < offset) {
      tokens.push({ text: line.slice(lastIndex, offset) });
    }

    if (boldText) {
      tokens.push({ text: boldText, bold: true });
    } else if (strikethroughText) {
      tokens.push({ text: strikethroughText, decoration: 'lineThrough' });
    } else if (italicText) {
      tokens.push({ text: italicText, italics: true });
    } else if (linkText && linkUrl) {
      tokens.push({ text: linkText, link: linkUrl, color: 'blue' });
    } else if (codeText) {
      tokens.push({ text: codeText, background: '#d9d9d9', margin: [0, 5, 0, 5] });
    }

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex) });
  }

  return tokens;
};

const convertMarkdownToPdfMake = (markdown: string): (PdfMakeText)[] => {
  const content: (PdfMakeText)[] = [];

  const lines = markdown.split('\n');
  lines.forEach((line) => {
    if (line.startsWith('-')) {
      content.push({ ul: [{ text: convertMarkdownToPdfMake(line.replace('-', '')) as PdfMakeText[] }] });
    } else if (line.startsWith('> ')) {
      content.push({ text: line.replace('> ', ''), margin: [5, 2, 0, 2], background: '#f1f2f3', italics: true });
    } else if (line.startsWith('# ')) {
      content.push({ text: line.replace('# ', ''), style: 'markdownHeaderH1' });
    } else if (line.startsWith('## ')) {
      content.push({ text: line.replace('## ', ''), style: 'markdownHeaderH2' });
    } else if (line.startsWith('### ')) {
      content.push({ text: line.replace('### ', '') });
    } else if (line.trim().length > 0) {
      const parsedLine = parseMarkdownLine(line);
      content.push(...parsedLine);
    }
  });

  return content;
};

export default convertMarkdownToPdfMake;
