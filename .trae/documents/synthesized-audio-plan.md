# 计划：使用代码生成滴滴声

## 目标
用 Web Audio API 替代外部音频文件，生成持续8分钟的滴滴声（每秒响一次）。

## 实现方案

### 技术选型
使用 **Web Audio API**，它是浏览器原生支持的音频生成接口，无需外部音频文件。

### 实现步骤

#### 1. 创建新的音频生成模块
**文件**: `src/composables/useSynthesizedAudio.js`

功能：
- 创建 `AudioContext` 实例
- 使用 `OscillatorNode` 生成短促的滴声
- 使用 `GainNode` 控制音量包络（快速衰减）
- 提供与现有 `useAudio` 相同的接口：`play()`, `pause()`, `resume()`, `stop()`

#### 2. 滴声参数设计
```
频率: 800-1000 Hz（清脆的滴声）
持续时间: 50-100ms
音量包络: 快速上升，指数衰减
间隔: 1秒
```

#### 3. 实现逻辑
```javascript
// 核心逻辑伪代码
function playTickSound() {
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.frequency.value = 880  // A5 音符
  osc.type = 'sine'
  
  gain.gain.setValueAtTime(0.3, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08)
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  osc.start()
  osc.stop(audioContext.currentTime + 0.1)
}

// 使用 setInterval 每秒触发一次
```

#### 4. 更新 App.vue
- 移除 `useAudio` 导入
- 导入新的 `useSynthesizedAudio`
- 保持相同的接口调用方式

#### 5. 清理旧文件
- 删除 `src/composables/useAudio.js`
- 可选：删除 `public/audios/clock-ticking-down.mp3`

## 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/composables/useSynthesizedAudio.js` | 新建 |
| `src/App.vue` | 修改导入 |
| `src/composables/useAudio.js` | 删除 |
| `src/data/exercises.js` | 移除 `AUDIO_TICKING` 常量 |

## 优势
- 无需加载外部音频文件
- 文件体积更小
- 可自定义滴声参数（频率、音量、持续时间）
- 浏览器兼容性好
