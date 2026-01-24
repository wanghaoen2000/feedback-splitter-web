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
 * - 小班课模式支持手动指定学生姓名
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { extractModules, MODULE_CONFIG, type ExtractedModules } from "@/lib/extractModules";
import { 
  extractClassModules, 
  extractClassModulesWithManualNames,
  parseManualNames,
  COMMON_MODULE_CONFIG, 
  STUDENT_MODULE_CONFIG, 
  type ClassModulesResult, 
  type StudentData 
} from "@/lib/extractClassModules";
import { Scissors, FileText, Copy, Check, User, Users, BookOpen, ClipboardList, UserPlus } from "lucide-react";

type Mode = "oneToOne" | "smallClass";

// 1对1模式的状态
interface OneToOneState {
  inputText: string;
  results: ExtractedModules | null;
  copiedModules: Record<string, boolean>;
}

// 小班课模式的状态
interface SmallClassState {
  inputText: string;
  results: ClassModulesResult | null;
  copiedModules: Record<string, boolean>; // 格式: "common_content", "student_0_homework" 等
  manualMode: boolean; // 是否手动输入学生姓名
  manualNames: string; // 手动输入的学生姓名
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
    inputText: "",
    results: null,
    copiedModules: {},
    manualMode: false,
    manualNames: ""
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

  // 小班课模式的操作函数
  const handleSmallClassSplit = () => {
    if (!smallClassState.inputText.trim()) {
      return;
    }
    
    let extracted: ClassModulesResult;
    
    if (smallClassState.manualMode && smallClassState.manualNames.trim()) {
      // 手动模式：使用用户指定的姓名列表
      const names = parseManualNames(smallClassState.manualNames);
      extracted = extractClassModulesWithManualNames(smallClassState.inputText, names);
    } else {
      // 自动模式：自动识别学生姓名
      extracted = extractClassModules(smallClassState.inputText);
    }
    
    setSmallClassState(prev => ({
      ...prev,
      results: extracted,
      copiedModules: {}
    }));
  };

  const handleSmallClassClear = () => {
    setSmallClassState({
      inputText: "",
      results: null,
      copiedModules: {},
      manualMode: false,
      manualNames: ""
    });
  };

  const handleSmallClassCopy = async (key: string, content: string) => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setSmallClassState(prev => ({
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

  // 小班课模式界面
  const SmallClassView = () => {
    const results = smallClassState.results;
    
    return (
      <>
        {/* 输入区 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              粘贴小班课反馈文本
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
            <Textarea
              placeholder="在此粘贴小班课的完整反馈文本..."
              value={smallClassState.inputText}
              onChange={(e) => setSmallClassState(prev => ({ ...prev, inputText: e.target.value }))}
              className="resize-none text-base sm:text-sm leading-relaxed w-full h-[8rem] sm:h-[7.5rem] overflow-y-auto"
            />
            
            {/* 手动输入学生姓名选项 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="manual-mode"
                  checked={smallClassState.manualMode}
                  onCheckedChange={(checked) => 
                    setSmallClassState(prev => ({ 
                      ...prev, 
                      manualMode: checked === true 
                    }))
                  }
                />
                <label 
                  htmlFor="manual-mode" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  手动输入学生姓名
                </label>
              </div>
              
              {/* 手动输入姓名的输入框 */}
              {smallClassState.manualMode && (
                <Input
                  placeholder="输入学生姓名，用逗号分隔，如：李亦然, 张安菲, 王小明"
                  value={smallClassState.manualNames}
                  onChange={(e) => setSmallClassState(prev => ({ ...prev, manualNames: e.target.value }))}
                  className="text-base sm:text-sm h-11 sm:h-10"
                />
              )}
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <Button 
                onClick={handleSmallClassSplit} 
                disabled={!smallClassState.inputText.trim()}
                className="h-11 sm:h-10 px-4 sm:px-4 text-base sm:text-sm flex-1 sm:flex-none"
              >
                <Scissors className="w-4 h-4 mr-2" />
                开始拆分
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSmallClassClear}
                disabled={!smallClassState.inputText && !smallClassState.results}
                className="h-11 sm:h-10 px-4 sm:px-4 text-base sm:text-sm"
              >
                清空
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 全班共用部分 */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">全班共用部分</h2>
          </div>
          
          {COMMON_MODULE_CONFIG.map((module, index) => {
            const content = results?.common[module.key as keyof typeof results.common] || "";
            const copyKey = `common_${module.key}`;
            const isCopied = smallClassState.copiedModules[copyKey] || false;
            
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
                    <Button
                      variant={isCopied ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSmallClassCopy(copyKey, content)}
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

        {/* 学生单独部分 */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 px-1">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              学生单独部分
              {results && results.students.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  （共 {results.students.length} 名学生）
                </span>
              )}
            </h2>
          </div>
          
          {/* 学生列表 */}
          {results && results.students.length > 0 ? (
            results.students.map((student, studentIndex) => (
              <StudentCard
                key={studentIndex}
                student={student}
                studentIndex={studentIndex}
                copiedModules={smallClassState.copiedModules}
                onCopy={handleSmallClassCopy}
              />
            ))
          ) : (
            <Card className="shadow-sm">
              <CardContent className="py-8 sm:py-12 px-4 sm:px-6">
                <div className="text-center space-y-2">
                  <Users className="w-10 h-10 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">
                    {smallClassState.inputText.trim() 
                      ? "未识别到学生信息，请检查反馈文本格式或尝试手动输入学生姓名"
                      : "等待拆分..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    );
  };

  // 学生卡片组件
  const StudentCard = ({ 
    student, 
    studentIndex, 
    copiedModules, 
    onCopy 
  }: { 
    student: StudentData; 
    studentIndex: number; 
    copiedModules: Record<string, boolean>;
    onCopy: (key: string, content: string) => void;
  }) => {
    // 检查该学生是否有任何内容
    const hasContent = student.homework || student.test || student.feedback;
    
    return (
      <Card className={`shadow-sm border-l-4 ${hasContent ? 'border-l-primary/60' : 'border-l-muted-foreground/30'}`}>
        <CardHeader className="pb-3 px-4 sm:px-6 bg-muted/20">
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-sm sm:text-base font-bold flex items-center justify-center flex-shrink-0 ${
              hasContent 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted-foreground/30 text-muted-foreground'
            }`}>
              {studentIndex + 1}
            </div>
            <span className={hasContent ? '' : 'text-muted-foreground'}>{student.name}</span>
            {!hasContent && (
              <span className="text-xs font-normal text-muted-foreground ml-2">（未找到该学生）</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pt-4">
          {STUDENT_MODULE_CONFIG.map((module) => {
            const content = student[module.key as keyof Omit<StudentData, 'name'>] || "";
            const copyKey = `student_${studentIndex}_${module.key}`;
            const isCopied = copiedModules[copyKey] || false;
            
            return (
              <div key={module.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-medium text-foreground">
                    {module.label}
                  </h4>
                  <Button
                    variant={isCopied ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCopy(copyKey, content)}
                    disabled={!content}
                    className={`h-8 sm:h-7 px-2.5 text-xs sm:text-sm ${
                      isCopied 
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                        : ""
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={content}
                  readOnly
                  placeholder="（无内容）"
                  className="resize-none text-base sm:text-sm leading-relaxed bg-muted/30 w-full h-[8rem] sm:h-[7.5rem] overflow-y-auto"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

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
