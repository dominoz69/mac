"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Download, Smartphone, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Expanded language map with more languages
const languageMap: Record<
  string,
  { display: string; extension: string; patterns: { regex: RegExp; className: string }[] }
> = {
  javascript: {
    display: "JavaScript",
    extension: "js",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex: /\b(function|return|const|let|var|if|else|for|while|class|import|export|from|async|await)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(console|document|window|Array|Object|String|Number|Boolean)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  typescript: {
    display: "TypeScript",
    extension: "ts",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(function|return|const|let|var|if|else|for|while|class|import|export|from|async|await|interface|type|namespace)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(console|document|window|Array|Object|String|Number|Boolean)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)<([^>]+)>/g, className: "generic" },
    ],
  },
  python: {
    display: "Python",
    extension: "py",
    patterns: [
      { regex: /(#.*)/g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex: /\b(def|class|if|else|elif|for|while|return|import|from|as|try|except|finally|with|in|is|not|and|or)\b/g,
        className: "keyword",
      },
      { regex: /\b(True|False|None)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(print|len|range|str|int|float|list|dict|set|tuple)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, className: "function" },
    ],
  },
  html: {
    display: "HTML",
    extension: "html",
    patterns: [
      { regex: /(&lt;!--[\s\S]*?--&gt;)/g, className: "comment" },
      { regex: /(&lt;\/?)([\w-]+)/g, className: "tag" },
      { regex: /([\w-]+)=(['"])(.*?)\2/g, className: "attr-name" },
      { regex: /(['"])(.*?)\1/g, className: "string" },
    ],
  },
  css: {
    display: "CSS",
    extension: "css",
    patterns: [
      { regex: /(\/\*[\s\S]*?\*\/)/g, className: "comment" },
      { regex: /([\w-]+):/g, className: "property" },
      { regex: /(#[a-f0-9]{3,8})\b/gi, className: "number" },
      { regex: /\b(\d+)(px|em|rem|%|vh|vw|s|ms)\b/gi, className: "number" },
      { regex: /(@media|@keyframes|@import|@charset|@font-face|@supports)\b/g, className: "keyword" },
      { regex: /(\.[\w-]+)/g, className: "selector-class" },
      { regex: /(#[\w-]+)/g, className: "selector-id" },
    ],
  },
  java: {
    display: "Java",
    extension: "java",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(public|private|protected|class|interface|extends|implements|import|package|return|if|else|for|while|do|switch|case|break|continue|new|static|final|void|this|super)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|null)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(System|String|Integer|Boolean|Double|Float|Object|Exception)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  csharp: {
    display: "C#",
    extension: "cs",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(public|private|protected|class|interface|using|namespace|return|if|else|for|while|do|switch|case|break|continue|new|static|readonly|const|void|this|base)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|null)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(Console|String|Int32|Boolean|Double|Float|Object|Exception)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  ruby: {
    display: "Ruby",
    extension: "rb",
    patterns: [
      { regex: /(#.*)/g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex: /\b(def|class|if|else|elsif|unless|for|while|until|begin|rescue|ensure|end|module|return|yield)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|nil)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(puts|print|require|include|attr_accessor|attr_reader|attr_writer)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
      { regex: /(@[A-Za-z$_][A-Za-z0-9$_]*)/g, className: "variable" },
    ],
  },
  go: {
    display: "Go",
    extension: "go",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(func|package|import|return|if|else|for|switch|case|break|continue|defer|go|chan|select|var|const|type|struct|interface|map)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|nil)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(fmt|string|int|bool|error)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  php: {
    display: "PHP",
    extension: "php",
    patterns: [
      { regex: /(\/\/.*|#.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(function|class|if|else|elseif|for|foreach|while|do|switch|case|break|continue|return|include|require|namespace|use|echo|print)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|null)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(array|string|int|bool|object)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
      { regex: /(\$[A-Za-z$_][A-Za-z0-9$_]*)/g, className: "variable" },
    ],
  },
  rust: {
    display: "Rust",
    extension: "rs",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(fn|let|mut|pub|struct|enum|trait|impl|use|mod|if|else|for|while|loop|match|return|self|Self|static|const|type|where|async|await)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|None|Some)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(String|Vec|Option|Result|Box)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  sql: {
    display: "SQL",
    extension: "sql",
    patterns: [
      { regex: /(--.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|HAVING|LIMIT|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|DATABASE|SCHEMA)\b/gi,
        className: "keyword",
      },
      { regex: /\b(AND|OR|NOT|IN|BETWEEN|LIKE|IS NULL|IS NOT NULL)\b/gi, className: "operator" },
      { regex: /\b(\d+)\b/g, className: "number" },
    ],
  },
  bash: {
    display: "Bash",
    extension: "sh",
    patterns: [
      { regex: /(#.*)/g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|in|return|exit)\b/g,
        className: "keyword",
      },
      { regex: /\b(echo|read|cd|ls|mkdir|rm|cp|mv|chmod|chown|grep|find|sed|awk)\b/g, className: "builtin" },
      { regex: /(\$\w+|\$\{\w+\})/g, className: "variable" },
      { regex: /\b(\d+)\b/g, className: "number" },
    ],
  },
  json: {
    display: "JSON",
    extension: "json",
    patterns: [
      { regex: /(")([\w-]+)("\s*:)/g, className: "property" },
      { regex: /:\s*(")(.*?)(")/g, className: "string" },
      { regex: /:\s*(\d+)/g, className: "number" },
      { regex: /:\s*(true|false|null)/g, className: "boolean" },
    ],
  },
  markdown: {
    display: "Markdown",
    extension: "md",
    patterns: [
      { regex: /^(#{1,6})\s+(.+)$/gm, className: "heading" },
      { regex: /\*\*(.*?)\*\*/g, className: "bold" },
      { regex: /\*(.*?)\*/g, className: "italic" },
      { regex: /`{3}([\s\S]*?)`{3}/g, className: "codeblock" },
      { regex: /`([^`]+)`/g, className: "inline-code" },
      { regex: /\[([^\]]+)\]$$([^)]+)$$/g, className: "link" },
      { regex: /!\[([^\]]+)\]$$([^)]+)$$/g, className: "image" },
      { regex: /^>\s+(.+)$/gm, className: "blockquote" },
      { regex: /^(\*|-|\+)\s+(.+)$/gm, className: "list-item" },
      { regex: /^(\d+\.)\s+(.+)$/gm, className: "ordered-list-item" },
    ],
  },
  yaml: {
    display: "YAML",
    extension: "yaml",
    patterns: [
      { regex: /(#.*)/g, className: "comment" },
      { regex: /^([^:]+):/gm, className: "property" },
      { regex: /:\s*(['"])(.*?)\1/g, className: "string" },
      { regex: /:\s*(\d+)/g, className: "number" },
      { regex: /:\s*(true|false|null|~)/g, className: "boolean" },
      { regex: /&(\w+)/g, className: "anchor" },
      { regex: /\*(\w+)/g, className: "alias" },
    ],
  },
  c: {
    display: "C",
    extension: "c",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(if|else|for|while|do|switch|case|break|continue|return|typedef|struct|enum|union|const|static|extern|void|int|char|float|double|unsigned|signed)\b/g,
        className: "keyword",
      },
      { regex: /\b(NULL|TRUE|FALSE)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(printf|scanf|malloc|free|memcpy|strcpy|strlen)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  cpp: {
    display: "C++",
    extension: "cpp",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(if|else|for|while|do|switch|case|break|continue|return|class|struct|enum|union|template|namespace|using|public|private|protected|virtual|inline|const|static|void|int|char|float|double|bool|auto|new|delete|try|catch|throw)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|nullptr|NULL)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(std|cout|cin|vector|string|map|set)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
      { regex: /(::)([A-Za-z$_][A-Za-z0-9$_]*)/g, className: "namespace" },
    ],
  },
  swift: {
    display: "Swift",
    extension: "swift",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(if|else|for|while|do|switch|case|break|continue|return|func|class|struct|enum|protocol|extension|import|var|let|guard|defer|where|in|as|is|try|catch|throw)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|nil)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(String|Int|Double|Bool|Array|Dictionary|Set)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  kotlin: {
    display: "Kotlin",
    extension: "kt",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(if|else|for|while|do|when|break|continue|return|fun|class|interface|object|val|var|import|package|internal|private|protected|public|override|open|final|abstract|companion|data|sealed|suspend|tailrec|operator|infix)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|null)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(String|Int|Double|Boolean|List|Map|Set)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
  dart: {
    display: "Dart",
    extension: "dart",
    patterns: [
      { regex: /(\/\/.*)/g, className: "comment" },
      { regex: /\/\*[\s\S]*?\*\//g, className: "comment" },
      { regex: /(['"`])(.*?)\1/g, className: "string" },
      {
        regex:
          /\b(if|else|for|while|do|switch|case|break|continue|return|class|extends|implements|mixin|import|export|library|part|as|show|hide|with|new|final|const|var|void|async|await|try|catch|finally|throw|assert)\b/g,
        className: "keyword",
      },
      { regex: /\b(true|false|null)\b/g, className: "boolean" },
      { regex: /\b(\d+)\b/g, className: "number" },
      { regex: /\b(String|int|double|bool|List|Map|Set|Future|Stream)\b/g, className: "builtin" },
      { regex: /\b([A-Za-z$_][A-Za-z0-9$_]*)\(/g, className: "function" },
    ],
  },
}

// Simple syntax highlighting function
function highlightCode(code: string, language: string): string {
  // Get language patterns or default to JavaScript
  const langPatterns = languageMap[language]?.patterns || languageMap.javascript.patterns

  // Escape HTML special characters
  let highlighted = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Apply each pattern
  langPatterns.forEach(({ regex, className }) => {
    highlighted = highlighted.replace(regex, (match, ...args) => {
      // Handle different regex capture groups
      if (className === "tag") {
        return `${args[0]}<span class="token tag">${args[1]}</span>`
      }
      if (className === "attr-name") {
        return `<span class="token attr-name">${args[0]}</span>=${args[1]}<span class="token string">${args[2]}</span>`
      }
      if (className === "function") {
        // Only highlight the function name, not the parenthesis
        return `<span class="token function">${match.slice(0, -1)}</span>(`
      }
      return `<span class="token ${className}">${match}</span>`
    })
  })

  // Replace newlines with <br> for HTML display
  return highlighted.replace(/\n/g, "<br>")
}

export default function MacTerminal() {
  const [code, setCode] = useState(
    "console.log('Hello, world!');\n\n// Type or paste your code here\nfunction example() {\n  return 'Code will be syntax highlighted';\n}",
  )
  const [language, setLanguage] = useState("javascript")
  const terminalRef = useRef<HTMLDivElement>(null)
  const codeElementRef = useRef<HTMLDivElement>(null)
  const [highlightedCode, setHighlightedCode] = useState("")
  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false)
  const [terminalHeight, setTerminalHeight] = useState(300)
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape")

  // Load html2canvas dynamically
  useEffect(() => {
    const loadHtml2Canvas = async () => {
      try {
        await import("html2canvas")
        setHtml2canvasLoaded(true)
      } catch (error) {
        console.error("Failed to load html2canvas:", error)
      }
    }

    loadHtml2Canvas()
  }, [])

  // Apply syntax highlighting when code or language changes
  useEffect(() => {
    setHighlightedCode(highlightCode(code, language))
  }, [code, language])

  const handleCodeChange = (e: React.FormEvent<HTMLDivElement>) => {
    // Get plain text content without HTML tags
    const newCode = e.currentTarget.innerText || ""
    setCode(newCode)
  }

  const downloadImage = async () => {
    if (!terminalRef.current || !html2canvasLoaded) return

    try {
      // Dynamically import html2canvas only when needed
      const html2canvasModule = await import("html2canvas")
      const html2canvas = html2canvasModule.default

      // Create a temporary container to hold the terminal for capturing
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "-9999px"
      document.body.appendChild(tempContainer)

      // Clone the terminal
      const terminalClone = terminalRef.current.cloneNode(true) as HTMLDivElement

      // Set a fixed width to match the original
      terminalClone.style.width = `${terminalRef.current.offsetWidth}px`

      // Remove height constraint and scrolling to show all content
      const contentDiv = terminalClone.querySelector('div[class*="p-4 font-mono"]') as HTMLDivElement
      if (contentDiv) {
        contentDiv.style.height = "auto"
        contentDiv.style.overflow = "visible"
        contentDiv.style.maxHeight = "none"
      }

      tempContainer.appendChild(terminalClone)

      // Capture the full terminal
      const canvas = await html2canvas(terminalClone, {
        backgroundColor: null,
        scale: 2, // Higher resolution
      })

      // Remove the temporary container
      document.body.removeChild(tempContainer)

      // Create a new canvas for rotation if needed
      let finalCanvas = canvas

      if (orientation === "portrait") {
        const rotatedCanvas = document.createElement("canvas")
        const ctx = rotatedCanvas.getContext("2d")

        if (!ctx) {
          throw new Error("Could not get canvas context")
        }

        // Set dimensions for portrait orientation (90 degree rotation)
        rotatedCanvas.width = canvas.height
        rotatedCanvas.height = canvas.width

        // Translate and rotate
        ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2)
        ctx.rotate((90 * Math.PI) / 180)
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)

        finalCanvas = rotatedCanvas
      }

      const image = finalCanvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `mac-terminal-code.${languageMap[language]?.extension || "txt"}`
      link.click()
    } catch (error) {
      console.error("Error generating image:", error)
      alert("Failed to generate image. Please try again.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-white">Mac Terminal Code Paster</h1>
          <div className="flex gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px] bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                {Object.entries(languageMap).map(([key, { display }]) => (
                  <SelectItem key={key} value={key} className="hover:bg-gray-700">
                    {display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs
              defaultValue="landscape"
              value={orientation}
              onValueChange={(value) => setOrientation(value as "landscape" | "portrait")}
            >
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="landscape" className="data-[state=active]:bg-gray-700">
                  <Monitor className="h-4 w-4 mr-1" />
                  Landscape
                </TabsTrigger>
                <TabsTrigger value="portrait" className="data-[state=active]:bg-gray-700">
                  <Smartphone className="h-4 w-4 mr-1" />
                  Portrait
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={downloadImage}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={!html2canvasLoaded}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="mb-4 p-4 rounded-lg bg-gray-800 shadow-md">
          <h2 className="text-lg font-medium mb-3 text-white">Terminal Height</h2>
          <div className="space-y-2">
            <Slider
              min={150}
              max={600}
              step={10}
              value={[terminalHeight]}
              onValueChange={(value) => setTerminalHeight(value[0])}
              className="w-full"
            />
            <div className="text-sm text-gray-400 text-right">{terminalHeight}px</div>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden shadow-2xl">
          {/* Terminal Window */}
          <div ref={terminalRef} className="bg-[#1e1e1e] text-white rounded-lg shadow-xl">
            {/* Terminal Header */}
            <div className="bg-[#323233] px-4 py-2 flex items-center rounded-t-lg">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-[#e0443e] opacity-0 hover:opacity-100"></div>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-[#dea123] opacity-0 hover:opacity-100"></div>
                </div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f] flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-[#1aab29] opacity-0 hover:opacity-100"></div>
                </div>
              </div>
              <div className="mx-auto text-sm text-gray-400">script.{languageMap[language]?.extension || "txt"}</div>
            </div>

            {/* Terminal Content */}
            <div className="p-4 font-mono text-sm overflow-auto" style={{ height: `${terminalHeight}px` }}>
              <div
                ref={codeElementRef}
                contentEditable
                spellCheck="false"
                className="outline-none whitespace-pre-wrap w-full h-full"
                onInput={handleCodeChange}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>
            Type or paste your code in the terminal above. Select orientation and click the download button to save as
            an image.
          </p>
        </div>
      </div>
    </div>
  )
}

