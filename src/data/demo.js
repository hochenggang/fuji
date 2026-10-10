// 课程模板：复制本文件重命名（如 my-course.js），填好后在 index.js 中 import 并加入 courses
export default {
  id: 'demo', // 唯一标识（英文 kebab-case，训练记录靠它关联课程）
  name: '示例课程', // 首页展示的课程名
  desc: '一句话课程标语，展示在页头', // 展示在标题下方
  cr: '© 2026 你的名字.', // 版权声明，展示在页脚
  steps: [ // 动作列表，按训练顺序排列
    {
      id: 1, // 动作序号，课程内唯一
      name: '动作名称',
      video: './videos/demo/1-1.mp4', // 相对 public 目录的视频路径
      targetMuscles: ['目标肌群 A', '目标肌群 B'],
      startingPosition: '起始姿势描述（可选）',
      steps: ['动作分解 1', '动作分解 2'], // 练习阶段循环展示的分解动作
      breathing: '呼吸节奏说明（可选）',
      tips: ['动作提示 1', '动作提示 2']
    }
  ]
}
