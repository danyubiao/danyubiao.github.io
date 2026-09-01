// 幻灯片数据：在 content script 的隔离世界中定义，供 content.js 使用。
// 想换成自己的内容，只改这里即可。图片和声音文件你自己放进 assets/ 与 assets/audio/。
//
//   src   : 形象图片 / GIF 路径。
//           扩展内资源写 'assets/xxx.png' 或 'assets/xxx.gif'；
//           也支持外链 'https://...' 或 base64 'data:image/...'。
//           GIF 会原生播放动画（就像桌宠待机动画）。
//   title : 标题文字
//   text  : 对话气泡文字（楷体蓝字，每 11 字自动换行，逻辑源自桌宠 talkdef）
//   audio : 声音文件路径，如 'assets/audio/xxx.wav'（也支持 .mp3）。
//           点「播放声音」或上/下一张切换时会播放它；
//           留空或省略，则该张回退为浏览器语音合成朗读 text。
window.SLIDES = [
  {
    src: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/normal/baibai.webp',
    title: '拜拜',
    text: '这是格的对话气泡文字，每十一个字富商大贾第三个会自动换行。点「播放声音」会播放你放入的音频文件。',
    audio: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/audio/actionwav/%E6%8B%9C%E6%8B%9C.wav'
  },
  {
    src: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/normal/dazhaohu.webp',
    title: '打招呼',
    text: '把 src 换成 .gif 路径即可展示动图，形象会动起来，就像桌宠待机动画一样。',
    audio: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/audio/actionwav/%E6%9C%8B%E5%8F%8B%EF%BC%8C%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E6%98%AF%E5%B0%8F%E8%AF%AD%E3%80%82.wav'
  },
  {
    src: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/normal/huangtou.webp',
    title: '晃头',
    text: '将一张 GIF 命名为 sample-3.gif 放进 assets 目录，刷新即可看到动图循环播放。',
    audio: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/audio/xiaoyu/%E5%97%AF%EF%BC%9F%E5%97%AF%EF%BC%9F%E6%80%AA%E6%88%91%E5%92%AF%EF%BC%9F.wav'
  },
  {
    src: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/normal/kaixin.webp',
    title: '开心',
    text: '将一张 GIF 命名为 sample-3.gif 放进 assets 目录，刷新即可看到动图循环播放。',
    audio: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/audio/actionwav/%E7%88%B1%E4%BD%A0%E4%BB%AC%EF%BC%8Cmua%20mua%20mua~.wav'
  },
  {
    src: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/normal/xuanzhuan.webp',
    title: '旋转',
    text: '将一张 GIF 命名为 sample-3.gif 放进 assets 目录，刷新即可看到动图循环播放。',
    audio: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/audio/quku/%E6%8A%8A%E5%A4%A7%E5%AE%B6%E5%AE%89%E5%85%A8%E9%80%81%E5%88%B0%E5%AE%B6%E5%96%8F%E3%80%82.wav'
  }
  ,
  {
    src: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/normal/xuanzhuan2.webp',
    title: '旋转',
    text: '将一张 GIF 命名为 sample-3.gif 放进 assets 目录，刷新即可看到动图循环播放。',
    audio: 'https://chunyu-1311908080.cos.ap-chengdu.myqcloud.com/audio/actionwav/%E8%B7%A8%E8%B6%8A%E6%AC%A1%E5%85%83%EF%BC%81%E6%9D%A5%E5%88%B0%E4%BD%A0%E7%9A%84%E8%BA%AB%E8%BE%B9%E5%96%8F%EF%BC%81.wav'
  }
];

// 对话库：右键菜单「对话库」子菜单会列出这里的每个 key。
// 进入某个库后，气泡每 5 秒随机抽一句显示（还原桌宠的定时 talkdef 随机对话）。
// 句子也走「每 11 字自动换行」；需要声音就在库项里加 audio，或保持纯文本。
// 你自己替换成想要的文字即可。
window.DIALOG_LIBS = {
  '古诗': [
    '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
    '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。'
  ],
  '情书': [
    '今天的云很好看，我想拍给你看，却发现自己更想见到你。',
    '如果思念有声音，大概整座城市此刻都在替我喊你的名字。',
    '你不用做谁的光，你只要做你自己，我就愿意一直看着。'
  ],
  '学习': [
    '学而不思则罔，思而不学则殆。',
    '今日事今日毕，拖延是灵感最大的敌人。',
    '把复杂的事拆成小步，每一步都不难，难的是开始。'
  ],
  '代办事项': [
    '记得喝水、起身走两步，别一直盯着屏幕。',
    '今天还有一件事没做，现在就去做掉它吧。',
    '睡前把明天的计划写下来，明天会轻松很多。'
  ]
};
