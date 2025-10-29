import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface MarkdownMessageProps {
  message: Message;
  renderMarkdown: boolean;
  isUser: boolean;
}

export const MarkdownMessage = memo(({ message, renderMarkdown, isUser }: MarkdownMessageProps) => {
  // Memoize markdown components to prevent recreation on every render
  const markdownComponents = useMemo(
    () => ({
          code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
            const isInline = !className?.includes('language-');
            return isInline ? (
              <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-800 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto my-2">
                <code className={`text-gray-100 text-sm ${className || ''}`} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => <>{children}</>,
          h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
          h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
          h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>,
          ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
          ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
          li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => <li className="ml-4">{children}</li>,
          p: ({ children }: React.HTMLAttributes<HTMLParagraphElement>) => <p className="my-2 leading-relaxed">{children}</p>,
          a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
              {children}
            </blockquote>
          ),
          table: ({ children }: React.HTMLAttributes<HTMLTableElement>) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }: React.HTMLAttributes<HTMLTableCellElement>) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
              {children}
            </td>
          ),
    }),
    []
  );

  if (!renderMarkdown || isUser) {
    return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {message.content}
      </ReactMarkdown>
    </div>
  );
});
