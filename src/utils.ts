import { VideoInfo } from "./types.js";
export const formatVideo = (video: VideoInfo): string => {
  return [
    `### [${video.title || '未知标题'}](${video.link || '#'})`,
    `- 封面：![封面](${video.cover || ''})`,
    `- 作者：${video.author || '未知'}`,
    `- 播放量：${video.views || '未知'}`,
    `- 时长：${video.duration || '未知'}`,
    `- 来源：${video.source || 'bilibili'}`,
    `---`,
  ].join('\n');
}
