import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
    value: string;
    onChange?: (value: string | undefined) => void;
    language?: string;
    readOnly?: boolean;
    height?: string;
    theme?: "vs-dark" | "light";
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language = "javascript",
    readOnly = false,
    height = "400px",
    theme = "vs-dark"
}) => {
    const editorRef = useRef<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        // Optional: configure editor settings here
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const containerStyle = isFullscreen ? {
        position: 'fixed' as 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        height: '100vh',
        backgroundColor: '#1e1e1e' // Match vs-dark
    } : {
        height: height
    };

    return (
        <div className={`relative border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-all ${isFullscreen ? 'p-4' : ''}`} style={containerStyle}>
            {/* Toolbar */}
            <div className="absolute top-2 right-4 z-10 flex gap-2">
                <button
                    onClick={toggleFullscreen}
                    className="p-1.5 bg-gray-800/80 text-gray-400 hover:text-white rounded-lg backdrop-blur-sm transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            <Editor
                height={isFullscreen ? "100%" : "100%"}
                defaultLanguage={language}
                language={language}
                value={value}
                theme={theme}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    readOnly: readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 20 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                }}
                loading={<div className="flex items-center justify-center h-full text-emerald-500 gap-2"><Loader2 className="animate-spin" /> Loading Editor...</div>}
            />
        </div>
    );
};

export default CodeEditor;
