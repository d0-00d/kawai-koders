const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { SSEClientTransport } = require('@modelcontextprotocol/sdk/client/sse.js');

let client = null;
let transport = null;

async function getStitchClient() {
  if (client) return client;

  const endpoint = process.env.STITCH_MCP_ENDPOINT;
  const apiKey = process.env.STITCH_API_KEY;

  if (!endpoint) {
    throw new Error('STITCH_MCP_ENDPOINT is not defined in .env');
  }

  transport = new SSEClientTransport(new URL(endpoint), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    }
  });

  client = new Client({
    name: 'kohnrad-saas-client',
    version: '1.0.0',
  }, {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {}
    }
  });

  try {
    await client.connect(transport);
    console.log('Successfully connected to Stitch MCP');
  } catch (error) {
    console.error('Failed to connect to Stitch MCP:', error);
    client = null;
    throw error;
  }

  return client;
}

module.exports = {
  getStitchClient
};
