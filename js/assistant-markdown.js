// A deliberately small, dependency-free Markdown renderer for assistant
// replies. It supports the subset the model actually emits in this UI:
// fenced code, inline code, bold, line breaks and safe inline links.
//
// Security: the source is HTML-escaped first, and links are only emitted for
// http(s): / mailto: URLs. Everything else (notably javascript:) stays text.

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s<>"']+|mailto:[^\s<>"']+)\)/g;

export function renderMarkdown(source) {
  if (typeof source !== 'string' || source.length === 0) return '';

  const blocks = [];
  const inline = [];

  return source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      blocks.push(code);
      return '\u0002' + (blocks.length - 1) + '\u0002';
    })
    .replace(/`([^`]+)`/g, (match, code) => {
      inline.push(code);
      return '\u0001' + (inline.length - 1) + '\u0001';
    })
    .replace(LINK_RE, (match, label, url) => {
      // Attribute is double-quoted, so only double quotes need encoding.
      const href = url.replace(/"/g, '%22');
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/\*\*(\S[^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/\u0002(\d+)\u0002/g, (match, index) => '<pre>' + blocks[+index] + '</pre>')
    .replace(/\u0001(\d+)\u0001/g, (match, index) => '<code>' + inline[+index] + '</code>');
}
