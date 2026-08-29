#!/usr/bin/env node
// HarvyX MCP Server — clean build
import { Server }               from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const API_BASE = (process.env.HARVYX_API_BASE || 'https://www.harvics.com').replace(/\/$/, '')
const API_KEY = 'H44GXUK4HUCDUZTR'

async function api(path, options = {}) {
  const url = `${API_BASE}/api/harvyx${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HarvyX API ${res.status}: ${body}`)
  }
  return res.json()
}

const server = new Server(
  { name: 'harvyx', version: '2.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'harvyx_get_stats',
      description: 'Pipeline health snapshot — lead counts by status, top verticals',
      inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
      name: 'harvyx_get_campaigns',
      description: 'Active campaigns with open/reply rates',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filter by status' },
          limit:  { type: 'number' },
          offset: { type: 'number' },
        },
      },
    },
    {
      name: 'harvyx_list_leads',
      description: 'Browse pipeline — filter by vertical, status, or search term',
      inputSchema: {
        type: 'object',
        properties: {
          vertical: { type: 'string' },
          status:   { type: 'string' },
          q:        { type: 'string', description: 'Free-text search' },
          limit:    { type: 'number' },
          offset:   { type: 'number' },
        },
      },
    },
    {
      name: 'harvyx_search_leads',
      description: 'Fast lookup of a specific person, company, or email',
      inputSchema: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Search query' },
        },
        required: ['q'],
      },
    },
    {
      name: 'harvyx_add_lead',
      description: 'Add a new contact to the pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          name:      { type: 'string' },
          email:     { type: 'string' },
          company:   { type: 'string' },
          vertical:  { type: 'string' },
          icp_score: { type: 'number' },
          source:    { type: 'string', enum: ['apollo', 'lusha', 'linkedin', 'manual', 'scraper'] },
        },
        required: ['name', 'email'],
      },
    },
    {
      name: 'harvyx_create_campaign',
      description: 'Create a new outreach campaign and enroll leads by vertical/status/IDs',
      inputSchema: {
        type: 'object',
        properties: {
          name:       { type: 'string', description: 'Campaign name' },
          templateId: { type: 'string', description: 'Template ID: connect_only | connect_dm | connect_dm_followup' },
          vertical:   { type: 'string', description: 'Enroll all leads from this vertical' },
          status:     { type: 'string', description: 'Lead status filter, default: new' },
          leadIds:    { type: 'array', items: { type: 'string' }, description: 'Specific lead IDs to enroll' },
        },
        required: ['name', 'templateId'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async ({ params: { name, arguments: args = {} } }) => {
  try {
    let result

    switch (name) {
      case 'harvyx_get_stats':
        result = await api('/stats')
        break

      case 'harvyx_get_campaigns': {
        const p = new URLSearchParams()
        if (args.status) p.set('status', args.status)
        if (args.limit)  p.set('limit',  String(args.limit))
        if (args.offset) p.set('offset', String(args.offset))
        result = await api(`/campaigns${p.toString() ? '?' + p : ''}`)
        break
      }

      case 'harvyx_list_leads': {
        const p = new URLSearchParams()
        if (args.vertical) p.set('vertical', args.vertical)
        if (args.status)   p.set('status',   args.status)
        if (args.q)        p.set('q',        args.q)
        if (args.limit)    p.set('limit',    String(args.limit))
        if (args.offset)   p.set('offset',   String(args.offset))
        result = await api(`/leads${p.toString() ? '?' + p : ''}`)
        break
      }

      case 'harvyx_search_leads':
        result = await api(`/leads?q=${encodeURIComponent(args.q)}`)
        break

      case 'harvyx_add_lead':
        result = await api('/leads', {
          method: 'POST',
          body: JSON.stringify(args),
        })
        break

      case 'harvyx_create_campaign':
        result = await api('/campaigns', {
          method: 'POST',
          body: JSON.stringify(args),
        })
        break

      default:
        throw new Error(`Unknown tool: ${name}`)
    }

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }

  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
process.stderr.write(`[HarvyX MCP v2] Connected to ${API_BASE}\n`)
