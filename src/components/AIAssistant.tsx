import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  selectedNodeId: string | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  onClose,
  onSubmit,
  selectedNodeId,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      onSubmit(prompt);
      setPrompt('');
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const suggestions = selectedNodeId 
    ? [
        'Make this more detailed',
        'Summarize this content',
        'Make it more professional',
        'Add creative elements',
      ]
    : [
        'Create a project plan',
        'Generate a brainstorm list',
        'Write a meeting agenda',
        'Create a task breakdown',
      ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-500">
                {selectedNodeId ? 'Update selected node' : 'Generate new content'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like me to {selectedNodeId ? 'update' : 'create'}?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe what you want${selectedNodeId ? ' to change' : ' to create'}...`}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all duration-200"
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Quick suggestions
              </p>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {selectedNodeId ? 'Update Node' : 'Create Node'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;