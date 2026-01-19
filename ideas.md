# 阅读课反馈拆分工具 - 设计方案

## 项目背景
这是一个实用工具，帮助老师从反馈文档中提取5个模块内容，按指定顺序显示，方便填写到学情反馈系统。

---

<response>
<text>
## 方案一：极简工具美学 (Utilitarian Minimalism)

### Design Movement
受 Dieter Rams 设计原则和日本无印良品启发的极简功能主义。

### Core Principles
1. **功能即美**：每个元素都有明确目的，去除一切装饰性元素
2. **呼吸空间**：大量留白让内容成为焦点
3. **克制用色**：单一强调色配合中性灰度
4. **清晰层级**：通过字号和间距建立视觉层次

### Color Philosophy
- 背景：纯白 #FFFFFF
- 文字：深炭灰 #1A1A1A
- 强调色：单一蓝色 #2563EB（仅用于按钮和交互元素）
- 分隔线：极淡灰 #F3F4F6

### Layout Paradigm
垂直单栏布局，输入区和输出区上下排列，每个模块卡片等宽堆叠。

### Signature Elements
1. 细线边框卡片，无阴影
2. 大号等宽数字序号

### Interaction Philosophy
即时响应，无过渡动画，状态变化通过颜色变化体现。

### Animation
无动画，追求即时反馈的工具感。

### Typography System
- 标题：思源黑体 Medium 18px
- 正文：系统默认字体 14px
- 序号：等宽字体 Bold 24px
</text>
<probability>0.08</probability>
</response>

---

<response>
<text>
## 方案二：温暖教育风格 (Warm Educational)

### Design Movement
受斯堪的纳维亚设计和现代教育产品（如 Notion、Linear）启发的温暖专业风格。

### Core Principles
1. **温暖专业**：柔和色调传递教育场景的亲和力
2. **卡片化信息**：每个模块独立成卡，便于视觉扫描
3. **微妙深度**：轻柔阴影和圆角营造层次感
4. **状态可见**：清晰的视觉反馈让操作过程透明

### Color Philosophy
- 背景：暖灰 #F9FAFB
- 卡片：纯白 #FFFFFF
- 主色：教育蓝 #3B82F6（信任、专业）
- 辅助色：成功绿 #10B981、警示橙 #F59E0B
- 文字：深灰 #374151

### Layout Paradigm
双区域布局：左侧固定输入区（占40%），右侧滚动结果区（占60%）。桌面端并排，移动端堆叠。

### Signature Elements
1. 圆角卡片配柔和阴影 (shadow-sm, rounded-xl)
2. 彩色标签标识模块类型
3. 复制按钮悬浮在每个卡片右上角

### Interaction Philosophy
操作有温度，每个交互都有视觉确认，成功/失败状态明确。

### Animation
- 按钮点击：scale(0.98) 微缩反馈
- 卡片出现：fadeIn + translateY 从下方滑入
- 复制成功：checkmark 图标弹出

### Typography System
- 标题：Inter Semi-bold 20px
- 模块名：Inter Medium 16px
- 正文：Inter Regular 14px，行高 1.6
- 序号：Inter Bold 14px，圆形背景
</text>
<probability>0.06</probability>
</response>

---

<response>
<text>
## 方案三：墨水纸张质感 (Ink & Paper)

### Design Movement
受传统印刷排版和日式文具美学启发的纸张质感设计。

### Core Principles
1. **纸张隐喻**：界面如同一张精心排版的纸质表格
2. **墨水层次**：通过墨色深浅而非彩色建立层次
3. **网格秩序**：严格的网格系统带来秩序感
4. **手工温度**：细微的纹理和不完美增添人文气息

### Color Philosophy
- 背景：米白纸色 #FFFEF5
- 文字：墨黑 #1C1917
- 边框：淡墨 #D6D3D1
- 强调：朱红印章色 #DC2626（仅用于重要操作）

### Layout Paradigm
表格式布局，模块名在左列，内容在右列，如同填写表格。顶部输入区如同信纸抬头。

### Signature Elements
1. 细实线边框，模拟表格线
2. 模块序号使用圆形印章样式
3. 微妙的纸张纹理背景

### Interaction Philosophy
如同在纸上书写，操作后内容"显现"在对应位置。

### Animation
- 内容出现：如墨水渗透般渐显 (opacity 0→1, 600ms ease)
- 按钮点击：如印章按压般微微下沉

### Typography System
- 标题：霞鹜文楷 或 思源宋体 24px
- 模块名：思源黑体 Medium 16px
- 正文：思源宋体 Regular 15px，行高 1.8
- 序号：思源黑体 Bold 14px
</text>
<probability>0.05</probability>
</response>

---

## 选定方案

**选择方案二：温暖教育风格 (Warm Educational)**

理由：
1. 符合教育场景的专业亲和感
2. 双栏布局提高效率，输入和结果同时可见
3. 卡片化设计便于后续添加复制功能
4. 现代感强，与主流教育产品风格一致
