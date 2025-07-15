import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface MarkdownProps {
  children: string;
  [key: string]: any;
}

const Markdown: React.FC<MarkdownProps> = ({ children, ...props }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} {...props}>
      {children}
    </ReactMarkdown>
  );
};

export default Markdown; 