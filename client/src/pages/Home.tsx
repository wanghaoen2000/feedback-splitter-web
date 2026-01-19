/**
 * 阅读课反馈拆分工具 - 主页面
 * 
 * Design: Warm Educational Style
 * - 双区域布局：左侧输入区，右侧结果区
 * - 暖灰背景 + 白色卡片 + 柔和阴影
 * - 教育蓝主色调
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { extractModules, MODULE_CONFIG, type ExtractedModules } from "@/lib/extractModules";
import { Scissors, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<ExtractedModules | null>(null);
  const [hasExtracted, setHasExtracted] = useState(false);

  const handleSplit = () => {
    if (!inputText.trim()) {
      return;
    }
    const extracted = extractModules(inputText);
    setResults(extracted);
    setHasExtracted(true);
  };

  const handleClear = () => {
    setInputText("");
    setResults(null);
    setHasExtracted(false);
  };

  const getModuleContent = (key: string): string => {
    if (!results) return "";
    return results[key as keyof ExtractedModules] || "";
  };

  const hasAnyContent = results && Object.values(results).some(v => v !== "");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">阅读课反馈拆分工具</h1>
              <p className="text-sm text-muted-foreground">快速提取反馈模块，方便填写学情系统</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Input Area */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  粘贴反馈文本
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="在此粘贴老师的完整反馈文本...

支持的模块标记：
【授课内容】
【随堂测试】
【作业批改】
【表现及建议】
【作业布置】"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] resize-none text-sm leading-relaxed"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSplit} 
                    className="flex-1"
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
          </div>

          {/* Right: Results Area */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="wait">
              {!hasExtracted ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Scissors className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">等待拆分</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    在左侧粘贴反馈文本，点击"开始拆分"按钮提取模块内容
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {!hasAnyContent && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">未找到任何模块</p>
                            <p className="text-sm text-amber-700 mt-1">
                              请确保文本中包含【授课内容】【随堂测试】【作业批改】【表现及建议】【作业布置】等标记
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {MODULE_CONFIG.map((module, index) => {
                    const content = getModuleContent(module.key);
                    return (
                      <motion.div
                        key={module.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ModuleCard
                          index={index + 1}
                          label={module.label}
                          content={content}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

interface ModuleCardProps {
  index: number;
  label: string;
  content: string;
}

function ModuleCard({ index, label, content }: ModuleCardProps) {
  const isEmpty = !content;

  return (
    <Card className={`shadow-sm transition-all ${isEmpty ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
            {index}
          </span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <p className="text-sm text-muted-foreground italic">（未找到该模块）</p>
        ) : (
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {content}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
