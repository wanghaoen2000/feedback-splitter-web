/**
 * 小班课反馈解析模块
 * 
 * 用于从小班课反馈文档中提取：
 * 1. 全班共用部分：授课内容、作业内容（作业布置）
 * 2. 每个学生单独部分：作业批改、随堂测情况、学情反馈（表现及建议）
 */

// 系统标记白名单 - 这些不是学生姓名
const SYSTEM_MARKERS = [
  '授课内容', '课堂笔记', '生词', '长难句讲解', '作业布置', 
  'OK', '附当堂讲解错题合集', '随堂测试', '作业批改', '表现及建议',
  '课后反思', '阅读材料', '词汇练习', '语法讲解', '听力练习', 
  '口语练习', '写作练习', '全班共用部分', '学生单独部分'
];

// 学生单独部分的模块配置
export const STUDENT_MODULE_CONFIG = [
  { key: 'homework', label: '作业批改', marker: '作业批改' },
  { key: 'test', label: '随堂测情况', marker: '随堂测试' },
  { key: 'feedback', label: '学情反馈', marker: '表现及建议' }
] as const;

// 全班共用部分的模块配置
export const COMMON_MODULE_CONFIG = [
  { key: 'content', label: '授课内容', marker: '授课内容' },
  { key: 'assignment', label: '作业内容', marker: '作业布置' }
] as const;

// 学生数据类型
export interface StudentData {
  name: string;
  homework: string;   // 作业批改
  test: string;       // 随堂测情况
  feedback: string;   // 学情反馈
}

// 全班共用数据类型
export interface CommonData {
  content: string;    // 授课内容
  assignment: string; // 作业内容
}

// 解析结果类型
export interface ClassModulesResult {
  common: CommonData;
  students: StudentData[];
}

/**
 * 判断一个字符串是否可能是学生姓名
 * 规则：2-4个汉字，不在系统标记白名单中
 */
function isStudentName(text: string): boolean {
  // 去除【】标记
  const cleanText = text.replace(/^【|】$/g, '').trim();
  
  // 检查是否是2-4个汉字
  const chineseNamePattern = /^[\u4e00-\u9fa5]{2,4}$/;
  if (!chineseNamePattern.test(cleanText)) {
    return false;
  }
  
  // 检查是否在系统标记白名单中
  if (SYSTEM_MARKERS.includes(cleanText)) {
    return false;
  }
  
  return true;
}

/**
 * 从文本中提取指定标记后的内容
 * 支持有【】和无【】两种格式
 */
function extractSection(text: string, marker: string, endMarkers: string[]): string {
  // 构建匹配模式：支持【marker】或单独的 marker
  const patterns = [
    new RegExp(`【${marker}】[：:]?\\s*`, 'g'),
    new RegExp(`^${marker}[：:]?\\s*`, 'gm')
  ];
  
  let startIndex = -1;
  let matchLength = 0;
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && (startIndex === -1 || match.index < startIndex)) {
      startIndex = match.index;
      matchLength = match[0].length;
    }
  }
  
  if (startIndex === -1) {
    return '';
  }
  
  const contentStart = startIndex + matchLength;
  let endIndex = text.length;
  
  // 查找最近的结束标记
  for (const endMarker of endMarkers) {
    // 支持有【】和无【】两种格式
    const endPatterns = [
      new RegExp(`【${endMarker}】`, 'g'),
      new RegExp(`^${endMarker}[：:]?\\s*`, 'gm')
    ];
    
    for (const pattern of endPatterns) {
      pattern.lastIndex = contentStart;
      const match = pattern.exec(text);
      if (match && match.index < endIndex) {
        endIndex = match.index;
      }
    }
  }
  
  // 特殊处理：作业布置后面可能是分隔线或"附当堂"
  if (marker === '作业布置') {
    const specialEndPatterns = [
      /^-{3,}/gm,
      /^附当堂/gm,
      /^={3,}/gm
    ];
    
    for (const pattern of specialEndPatterns) {
      pattern.lastIndex = contentStart;
      const match = pattern.exec(text);
      if (match && match.index < endIndex) {
        endIndex = match.index;
      }
    }
  }
  
  return text.slice(contentStart, endIndex).trim();
}

/**
 * 查找所有学生姓名及其在文本中的位置
 */
function findStudentNames(text: string): Array<{ name: string; index: number }> {
  const students: Array<{ name: string; index: number }> = [];
  
  // 按行分析文本
  const lines = text.split('\n');
  let currentIndex = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 检查是否是【姓名】格式
    const bracketMatch = trimmedLine.match(/^【([\u4e00-\u9fa5]{2,4})】$/);
    if (bracketMatch && isStudentName(bracketMatch[1])) {
      students.push({
        name: bracketMatch[1],
        index: currentIndex + line.indexOf('【')
      });
    }
    // 检查是否是单独的姓名（独占一行，2-4个汉字）
    else if (isStudentName(trimmedLine)) {
      // 额外检查：后面几行应该有"随堂测试"或"作业批改"相关内容
      const lineIndex = lines.indexOf(line);
      const nextLines = lines.slice(lineIndex + 1, lineIndex + 5).join('\n');
      if (nextLines.includes('随堂测试') || nextLines.includes('作业批改') || nextLines.includes('表现及建议')) {
        students.push({
          name: trimmedLine,
          index: currentIndex + line.indexOf(trimmedLine)
        });
      }
    }
    
    currentIndex += line.length + 1; // +1 for newline
  }
  
  return students;
}

/**
 * 提取单个学生的所有模块内容
 */
function extractStudentModules(studentText: string): Omit<StudentData, 'name'> {
  const result = {
    homework: '',
    test: '',
    feedback: ''
  };
  
  // 所有可能的结束标记
  const allMarkers = ['作业批改', '随堂测试', '表现及建议', '诊断'];
  
  // 提取作业批改
  result.homework = extractStudentSection(studentText, '作业批改', ['随堂测试', '表现及建议']);
  
  // 提取随堂测试（包含诊断部分）
  result.test = extractStudentSection(studentText, '随堂测试', ['作业批改', '表现及建议']);
  
  // 提取表现及建议
  result.feedback = extractStudentSection(studentText, '表现及建议', ['作业批改', '随堂测试']);
  
  return result;
}

/**
 * 提取学生模块内容的辅助函数
 */
function extractStudentSection(text: string, marker: string, endMarkers: string[]): string {
  // 构建匹配模式
  const patterns = [
    new RegExp(`${marker}[：:]?\\s*`, 'g'),
    new RegExp(`^${marker}[：:]?\\s*`, 'gm')
  ];
  
  let startIndex = -1;
  let matchLength = 0;
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && (startIndex === -1 || match.index < startIndex)) {
      startIndex = match.index;
      matchLength = match[0].length;
    }
  }
  
  if (startIndex === -1) {
    return '';
  }
  
  const contentStart = startIndex + matchLength;
  let endIndex = text.length;
  
  // 查找最近的结束标记
  for (const endMarker of endMarkers) {
    const pattern = new RegExp(`${endMarker}[：:]?`, 'g');
    pattern.lastIndex = contentStart;
    const match = pattern.exec(text);
    if (match && match.index < endIndex) {
      endIndex = match.index;
    }
  }
  
  return text.slice(contentStart, endIndex).trim();
}

/**
 * 主解析函数：提取小班课反馈的所有模块
 */
export function extractClassModules(text: string): ClassModulesResult {
  const result: ClassModulesResult = {
    common: {
      content: '',
      assignment: ''
    },
    students: []
  };
  
  // 1. 提取全班共用部分
  // 授课内容的结束标记
  const contentEndMarkers = ['课堂笔记', '生词', '长难句讲解', '作业布置', '随堂测试', '作业批改'];
  result.common.content = extractSection(text, '授课内容', contentEndMarkers);
  
  // 作业布置的结束标记
  const assignmentEndMarkers = ['课堂笔记', '生词', '长难句讲解', '附当堂讲解错题合集', 'OK'];
  result.common.assignment = extractSection(text, '作业布置', assignmentEndMarkers);
  
  // 2. 查找所有学生
  const studentPositions = findStudentNames(text);
  
  // 3. 提取每个学生的内容
  for (let i = 0; i < studentPositions.length; i++) {
    const student = studentPositions[i];
    const nextStudent = studentPositions[i + 1];
    
    // 确定学生内容的范围
    const startIndex = student.index;
    let endIndex = text.length;
    
    if (nextStudent) {
      endIndex = nextStudent.index;
    } else {
      // 最后一个学生，查找【OK】或 OK 作为结束
      const okMatch = text.slice(startIndex).match(/【OK】|^OK$/m);
      if (okMatch && okMatch.index !== undefined) {
        endIndex = startIndex + okMatch.index;
      }
    }
    
    const studentText = text.slice(startIndex, endIndex);
    const modules = extractStudentModules(studentText);
    
    result.students.push({
      name: student.name,
      ...modules
    });
  }
  
  return result;
}

/**
 * 获取学生姓名列表（用于UI显示）
 */
export function getStudentNames(text: string): string[] {
  const positions = findStudentNames(text);
  return positions.map(p => p.name);
}
