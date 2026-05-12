const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");

const { z } = require("zod");

const server = new McpServer({
  name: "weather-mcp-server-js",
  version: "1.0.0",
});

server.tool(
  "get_weather",
  "获取指定城市的当前天气信息",
  {
    city: z.string().describe("城市名称，例如：北京、上海、成都"),
  },

  async ({ city }) => {
    try {
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("天气服务响应异常");
      }

      const data = await response.json();
      const current = data.current_condition[0];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                city: city,
                temperature: `${current.temp_C}°C`,
                feelsLike: `${current.FeelsLikeC}°C`,
                description: current.weatherDesc[0].value,
                humidity: `${current.humidity}%`,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `查询 ${city} 的天气失败。请确保城市名称正确，或检查网络连接。`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("天气 MCP Server (JS版) 已成功启动！");
}

main().catch((err) => {
  console.error("Server 启动失败:", err);
  process.exit(1);
});