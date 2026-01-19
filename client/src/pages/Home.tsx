/**
 * 阅读课反馈拆分工具 - 主页面
 * 
 * Design: 简洁清爽风格
 * - 上下布局：输入区在上，输出区在下
 * - 所有文本框固定5行高度，可滚动
 * - 输出文本框只读
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { extractModules, MODULE_CONFIG, type ExtractedModules } from "@/lib/extractModules";
import { Scissors, FileText } from "lucide-react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<ExtractedModules | null>(null);

  const handleSplit = () => {
    if (!inputText.trim()) {
      return;
    }
    const extracted = extractModules(inputText);
    setResults(extracted);
  };

  const handleClear = () => {
    setInputText("");
    setResults(null);
  };

  const getModuleContent = (key: string): string => {
    if (!results) return "";
    return results[key as keyof ExtractedModules] || "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">阅读课反馈拆分工具</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* 输入区 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              粘贴反馈文本
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="在此粘贴老师的完整反馈文本..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="resize-none text-sm leading-relaxed"
              style={{ height: '7.5rem' }} // 5行高度 (5 * 1.5rem line-height)
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleSplit} 
                disabled={!inputText.trim()}
              >
                <Scissors className="w-4 h-4 mr-2" />
                开始拆分
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={!inputText && !results}
              >
                清空
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 输出区 */}
        <div className="space-y-4">
          {MODULE_CONFIG.map((module, index) => {
            const content = getModuleContent(module.key);
            return (
              <Card key={module.key} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {module.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={content}
                    readOnly
                    placeholder="（等待拆分...）"
                    className="resize-none text-sm leading-relaxed bg-muted/30"
                    style={{ height: '7.5rem' }} // 5行高度
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
