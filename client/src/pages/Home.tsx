/**
 * 阅读课反馈拆分工具 - 主页面
 * 
 * Design: 简洁清爽风格，移动端优先
 * - 支持「1对1」和「小班课」两种模式切换
 * - 上下布局：输入区在上，输出区在下
 * - 所有文本框固定5行高度，可滚动
 * - 输出文本框只读，带复制按钮
 * - 复制后按钮变勾，持久显示直到重新拆分或清空
 * - 响应式设计：适配手机、iPad、桌面
 * - 切换模式时各自内容独立保存
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { extractModules, MODULE_CONFIG, type ExtractedModules } from "@/lib/extractModules";
import { Scissors, FileText, Copy, Check, User, Users } from "lucide-react";

type Mode = "oneToOne" | "smallClass";

// 1对1模式的状态
interface OneToOneState {
  inputText: string;
  results: ExtractedModules | null;
  copiedModules: Record<string, boolean>;
}

// 小班课模式的状态（暂时简单）
interface SmallClassState {
  inputText: string;
}

export default function Home() {
  // 当前模式
  const [mode, setMode] = useState<Mode>("oneToOne");
  
  // 1对1模式状态
  const [oneToOneState, setOneToOneState] = useState<OneToOneState>({
    inputText: "",
    results: null,
    copiedModules: {}
  });
  
  // 小班课模式状态
  const [smallClassState, setSmallClassState] = useState<SmallClassState>({
    inputText: ""
  });

  // 1对1模式的操作函数
  const handleSplit = () => {
    if (!oneToOneState.inputText.trim()) {
      return;
    }
    const extracted = extractModules(oneToOneState.inputText);
    setOneToOneState(prev => ({
      ...prev,
      results: extracted,
      copiedModules: {}
    }));
  };

  const handleClear = () => {
    setOneToOneState({
      inputText: "",
      results: null,
      copiedModules: {}
    });
  };

  const handleCopy = async (key: string, content: string) => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setOneToOneState(prev => ({
        ...prev,
        copiedModules: {
          ...prev.copiedModules,
          [key]: true
        }
      }));
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const getModuleContent = (key: string): string => {
    if (!oneToOneState.results) return "";
    return oneToOneState.results[key as keyof ExtractedModules] || "";
  };

  // 模式切换 Tab 组件
  const ModeTab = () => (
    <div className="flex bg-muted/50 rounded-lg p-1 gap-1">
      <button
        onClick={() => setMode("oneToOne")}
        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${
          mode === "oneToOne"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        }`}
      >
        <User className="w-4 h-4" />
        <span>1对1</span>
      </button>
      <button
        onClick={() => setMode("smallClass")}
        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 sm:flex-none ${
          mode === "smallClass"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        }`}
      >
        <Users className="w-4 h-4" />
        <span>小班课</span>
      </button>
    </div>
  );

  // 1对1模式界面
  const OneToOneView = () => (
    <>
      {/* 输入区 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            粘贴反馈文本
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <Textarea
            placeholder="在此粘贴老师的完整反馈文本..."
            value={oneToOneState.inputText}
            onChange={(e) => setOneToOneState(prev => ({ ...prev, inputText: e.target.value }))}
            className="resize-none text-base sm:text-sm leading-relaxed w-full h-[8rem] sm:h-[7.5rem] overflow-y-auto"
          />
          <div className="flex gap-2 sm:gap-3">
            <Button 
              onClick={handleSplit} 
              disabled={!oneToOneState.inputText.trim()}
              className="h-11 sm:h-10 px-4 sm:px-4 text-base sm:text-sm flex-1 sm:flex-none"
            >
              <Scissors className="w-4 h-4 mr-2" />
              开始拆分
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={!oneToOneState.inputText && !oneToOneState.results}
              className="h-11 sm:h-10 px-4 sm:px-4 text-base sm:text-sm"
            >
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 输出区 */}
      <div className="space-y-3 sm:space-y-4">
        {MODULE_CONFIG.map((module, index) => {
          const content = getModuleContent(module.key);
          const isCopied = oneToOneState.copiedModules[module.key] || false;
          
          return (
            <Card key={module.key} className="shadow-sm">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    {module.label}
                  </CardTitle>
                  {/* 复制按钮 */}
                  <Button
                    variant={isCopied ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCopy(module.key, content)}
                    disabled={!content}
                    className={`h-9 sm:h-8 px-3 text-sm ${
                      isCopied 
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                        : ""
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <Textarea
                  value={content}
                  readOnly
                  placeholder="（等待拆分...）"
                  className="resize-none text-base sm:text-sm leading-relaxed bg-muted/30 w-full h-[8rem] sm:h-[7.5rem] overflow-y-auto"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );

  // 小班课模式界面（占位）
  const SmallClassView = () => (
    <Card className="shadow-sm">
      <CardContent className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">小班课模式</h3>
            <p className="text-muted-foreground text-sm">
              小班课反馈拆分功能开发中...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header - 移动端优化 */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">阅读课反馈拆分工具</h1>
          </div>
        </div>
      </header>

      {/* Main Content - 移动端优化间距 */}
      <main className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 模式切换 Tab */}
        <ModeTab />

        {/* 根据模式显示不同界面 */}
        {mode === "oneToOne" ? <OneToOneView /> : <SmallClassView />}
      </main>

      {/* 底部安全区域 - 适配 iPhone 刘海屏 */}
      <div className="h-4 sm:h-6" />
    </div>
  );
}
