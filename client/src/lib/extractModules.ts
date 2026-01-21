/**
 * 阅读课反馈拆分工具 - 模块提取函数
 * 
 * 从老师的阅读课反馈文档中提取5个指定模块的内容
 */

export interface ExtractedModules {
  assignment: string;    // 本次作业布置 ← 【作业布置】
  homework: string;      // 上次作业批改 ← 【作业批改】
  test: string;          // 随堂测情况 ← 【随堂测试】
  content: string;       // 授课内容 ← 【授课内容】
  suggestions: string;   // 表现及建议 ← 【表现及建议】
}

// 模块配置：显示名称、字段名、原文标记
export const MODULE_CONFIG = [
  { key: 'assignment', label: '本次作业布置', tag: '作业布置' },
  { key: 'homework', label: '上次作业批改', tag: '作业批改' },
  { key: 'test', label: '随堂测情况', tag: '随堂测试' },
  { key: 'content', label: '授课内容', tag: '授课内容' },
  { key: 'suggestions', label: '表现及建议', tag: '表现及建议' },
] as const;

/**
 * 白名单：只有这些标记才被识别为真正的模块标记
 * 其他如【30分钟】、【OK】等不会被识别
 */
const VALID_MODULE_TAGS = [
  '授课内容',
  '课堂笔记',
  '随堂测试',
  '作业批改',
  '表现及建议',
  '生词',
  '长难句讲解',
  '作业布置',
  'OK',
];

/**
 * 生成匹配有效模块标记的正则表达式
 * 模块标记必须在行首（前面只有空白字符）
 */
function getValidModulePattern(): RegExp {
  const escapedTags = VALID_MODULE_TAGS.map(tag => 
    tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  // 匹配行首（或字符串开头）的有效模块标记
  return new RegExp(`(?:^|\\n)\\s*【(${escapedTags.join('|')})】`, 'g');
}

/**
 * 提取单个模块的内容
 */
function extractSingleModule(text: string, moduleName: string): string {
  // 查找目标模块的起始位置
  const startPattern = new RegExp(`(?:^|\\n)\\s*【${moduleName}】\\s*`);
  const startMatch = text.match(startPattern);
  
  if (!startMatch || startMatch.index === undefined) {
    return "";
  }

  const contentStartIndex = startMatch.index + startMatch[0].length;
  const remainingText = text.substring(contentStartIndex);

  // 构建结束模式
  let endIndex = remainingText.length;

  if (moduleName === "作业布置") {
    // 【作业布置】的特殊处理：
    // 1. 结束于下一个有效模块标记
    // 2. 或者"附当堂"开头的行
    // 3. 或者连续的"-"分隔线
    
    // 检查分隔线
    const separatorMatch = remainingText.match(/^-{3,}/m);
    if (separatorMatch && separatorMatch.index !== undefined) {
      endIndex = Math.min(endIndex, separatorMatch.index);
    }
    
    // 检查"附当堂"
    const attachMatch = remainingText.match(/^附当堂/m);
    if (attachMatch && attachMatch.index !== undefined) {
      endIndex = Math.min(endIndex, attachMatch.index);
    }
  }

  // 查找下一个有效模块标记
  const validModulePattern = getValidModulePattern();
  let match;
  while ((match = validModulePattern.exec(remainingText)) !== null) {
    if (match.index < endIndex) {
      endIndex = match.index;
      break;
    }
  }

  const moduleContent = remainingText.substring(0, endIndex);
  return trimBlankLines(moduleContent);
}

/**
 * 去除字符串首尾的空白行
 */
function trimBlankLines(text: string): string {
  let result = text.replace(/^[\s\n]*\n/, '');
  result = result.replace(/\n[\s\n]*$/, '');
  
  if (result.trim() === '') {
    return '';
  }
  
  return result.trim();
}

/**
 * 从反馈文本中提取所有模块
 * 
 * @param text - 完整的反馈文本
 * @returns 包含5个模块内容的对象
 */
export function extractModules(text: string): ExtractedModules {
  const result: ExtractedModules = {
    assignment: "",
    homework: "",
    test: "",
    content: "",
    suggestions: ""
  };

  const moduleMapping: Record<string, keyof ExtractedModules> = {
    "作业布置": "assignment",
    "作业批改": "homework",
    "随堂测试": "test",
    "授课内容": "content",
    "表现及建议": "suggestions"
  };

  for (const [moduleName, fieldName] of Object.entries(moduleMapping)) {
    result[fieldName] = extractSingleModule(text, moduleName);
  }

  return result;
}
