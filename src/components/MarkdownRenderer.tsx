import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

export default function MarkdownRenderer({ content, isDarkMode = false }: MarkdownRendererProps) {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !className;

      if (isInline) {
        return (
          <code className="md-inline-code" {...props}>
            {children}
          </code>
        );
      }

      return (
        <div className="md-code-block">
          {match && (
            <div className="md-code-header">
              <span className="md-code-lang">{match[1]}</span>
            </div>
          )}
          <SyntaxHighlighter
            style={isDarkMode ? oneDark : oneLight}
            language={match?.[1] || 'text'}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: match ? '0 0 10px 10px' : '10px',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
    p({ children }) {
      return <p className="md-paragraph">{children}</p>;
    },
    h1({ children }) {
      return <h1 className="md-heading md-h1">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="md-heading md-h2">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="md-heading md-h3">{children}</h3>;
    },
    h4({ children }) {
      return <h4 className="md-heading md-h4">{children}</h4>;
    },
    ul({ children }) {
      return <ul className="md-list md-ul">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="md-list md-ol">{children}</ol>;
    },
    li({ children }) {
      return <li className="md-list-item">{children}</li>;
    },
    blockquote({ children }) {
      return <blockquote className="md-blockquote">{children}</blockquote>;
    },
    table({ children }) {
      return (
        <div className="md-table-wrapper">
          <table className="md-table">{children}</table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="md-thead">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody className="md-tbody">{children}</tbody>;
    },
    tr({ children }) {
      return <tr className="md-tr">{children}</tr>;
    },
    th({ children }) {
      return <th className="md-th">{children}</th>;
    },
    td({ children }) {
      return <td className="md-td">{children}</td>;
    },
    a({ href, children }) {
      return (
        <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    strong({ children }) {
      return <strong className="md-strong">{children}</strong>;
    },
    em({ children }) {
      return <em className="md-em">{children}</em>;
    },
    hr() {
      return <hr className="md-hr" />;
    },
  };

  return (
    <div className={`md-renderer ${isDarkMode ? 'md-dark' : 'md-light'}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
