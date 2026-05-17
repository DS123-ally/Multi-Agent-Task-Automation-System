import React from "react";
import { Copy, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageProps {
  type: "plan" | "tool" | "output" | "error" | "user";
  content: string;
  onCopy?: () => void;
  onSave?: () => void;
}

const typeIcons = {
  plan: "📋",
  tool: "🛠️",
  output: "✅",
  error: "❌",
  user: "👤",
};

const typeColors = {
  plan: "bg-blue-50 border-blue-200",
  tool: "bg-purple-50 border-purple-200",
  output: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  user: "bg-gray-50 border-gray-200",
};

const typeLabels = {
  plan: "Plan",
  tool: "Tool Selected",
  output: "Output",
  error: "Error",
  user: "You",
};

export const Message: React.FC<MessageProps> = ({
  type,
  content,
  onCopy,
  onSave,
}) => {
  return (
    <div
      className={`animate-fade-in rounded-lg border-l-4 p-4 mb-4 ${
        typeColors[type]
      } ${type === "error" ? "border-red-300" : "border-gray-300"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <span>{typeIcons[type]}</span>
          {typeLabels[type]}
        </h4>
        {type !== "user" && (
          <div className="flex gap-2">
            {onCopy && (
              <button
                onClick={onCopy}
                className="p-1 hover:bg-gray-200 rounded transition"
                title="Copy to clipboard"
              >
                <Copy size={16} className="text-gray-600" />
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                className="p-1 hover:bg-gray-200 rounded transition"
                title="Save to history"
              >
                <Save size={16} className="text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>
      {type === "output" || type === "plan" ? (
        <div className="prose prose-sm max-w-none break-words text-gray-800 overflow-x-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || "(no content)"}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap break-words text-sm overflow-x-auto">
          {content || "(no content)"}
        </p>
      )}
    </div>
  );
};
