// server/routes/index.js - Base API routes
const express = require('express');
const router = express.Router();
const { getStitchClient } = require('../mcp/stitchClient');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', company: 'Kohnrad' });
});

// Stitch MCP status endpoint
router.get('/stitch/status', async (req, res) => {
  try {
    const client = await getStitchClient();
    
    // Attempt to list tools as a ping to verify connection
    const tools = await client.listTools();
    
    res.json({
      status: 'connected',
      message: 'Successfully connected to Stitch MCP API',
      toolsCount: tools?.tools?.length || 0
    });
  } catch (error) {
    console.error('Stitch MCP Error:', error);
    res.status(503).json({
      status: 'unreachable',
      message: 'Could not connect to Stitch MCP API',
      error: error.message || 'Unknown error'
    });
  }
});

module.exports = router;
