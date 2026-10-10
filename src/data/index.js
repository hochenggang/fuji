import chrisheriaAbs from './chrisheria-abs.js'
import leanMuscle from './lean-muscle.js'

// 训练课程注册表：新增课程仿照 demo.js 编写课程文件，import 后加入 courses
export const courses = [chrisheriaAbs, leanMuscle]

export function findCourseById(id) {
  return courses.find((course) => course.id === id) || courses[0]
}

// 训练难度为全局配置，不随课程变化
export const difficultySettings = {
  beginner: {
    name: '新手',
    exercise: 30,
    rest: 30,
    multiplier: 0.5,
    ratio: '练习30秒 · 休息30秒'
  },
  intermediate: {
    name: '中级',
    exercise: 40,
    rest: 20,
    multiplier: 0.9,
    ratio: '练习40秒 · 休息20秒'
  },
  advanced: {
    name: '进阶',
    exercise: 45,
    rest: 15,
    multiplier: 1.25,
    ratio: '练习45秒 · 休息15秒'
  }
}
