# 计划：视频兼容性优化

## 问题分析

### 微信内置浏览器
- 视频无法自动播放，微信对 `autoplay` 有严格限制
- 需要监听 `WeixinJSBridgeReady` 事件来触发播放

### 小米浏览器
- `@playing` 事件可能不会正确触发
- 视频未加载就开始计时

## 解决方案

### 1. 微信特殊处理
使用微信 JSBridge API 触发自动播放：
```javascript
document.addEventListener("WeixinJSBridgeReady", function () { 
    video.play(); 
}, false);
```

### 2. 多重事件监听
监听多个视频事件，任一触发即认为视频就绪：
- `playing` - 视频开始播放
- `canplay` - 视频可以播放
- `loadeddata` - 视频数据已加载

### 3. 超时降级机制
设置超时时间（3秒），如果视频未就绪则自动开始计时：
- 避免用户无限等待
- 保证训练流程不会卡住

### 4. 用户交互触发（备用）
在视频区域添加点击播放功能：
- 作为最后的降级方案
- 提供视觉提示引导用户

## 实现步骤

### 步骤 1：更新 VideoPlayer.vue
- 添加 `WeixinJSBridgeReady` 事件监听
- 添加 `canplay`、`loadeddata` 事件监听
- 添加超时检测（3秒）
- 添加点击播放功能（备用）

### 步骤 2：更新 useTraining.js
- 添加视频超时处理
- 超时后自动开始计时

### 步骤 3：更新 App.vue
- 处理视频超时事件
- 超时时也启动滴答声

## 文件变更清单

| 文件 | 变更内容 |
|------|----------|
| VideoPlayer.vue | 微信 JSBridge、多事件监听、超时检测、点击播放 |
| useTraining.js | 添加视频超时状态和处理 |
| App.vue | 处理视频超时事件 |

## 兼容性保证

| 浏览器 | 行为 |
|--------|------|
| Chrome/Safari | 视频自动播放，正常触发事件 |
| 微信浏览器 | WeixinJSBridgeReady 触发播放 |
| 小米浏览器 | 超时3秒后自动开始计时 |
| 其他浏览器 | 多事件监听 + 超时降级 |
