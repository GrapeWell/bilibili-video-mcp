import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { crawlBilibili } from './api.js'
import { formatVideo } from './utils.js'
const server = new McpServer({
  name: 'bilibili-video',
  version: '1.0.0',
})

server.tool(
  'get-videos',
  '获取视频',
  {
    tag: z.array(z.string()).describe('视频标签（可多个）'),
    k: z.number().default(5).describe('获取视频的数量'),
    order: z.enum(['click', 'pubdate', 'dm', 'default']).default('default').describe('视频排序方式, click表示最多播放，pubdate表示最新发布，dm表示最多弹幕，default表示没有排序'),
  },
  async ({ tag, k, order }) => {
    const keyword = tag.join(' ');
    const videos = await crawlBilibili(keyword, k, order);

    if (videos.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `没有找到与标签 "${tag}" 相关的视频。`,
          }
        ]
      }
    }

    const formattedAlerts = videos.map(formatVideo);
    const videosText = `视频列表:\n\n${formattedAlerts.join("\n")}`;

    return {
      content: [
        {
          type: 'text',
          text: videosText,
        }
      ]
    }
  }
)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("main()中的致命错误:", error);
  process.exit(1);
});
