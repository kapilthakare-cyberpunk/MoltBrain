/**
 * MCP Server Implementation
 * Exposes MoltBrain memory capabilities via Model Context Protocol
 */

import { createServer, Server } from 'net';
import { MCPRequest, MCPResponse, MCPNotification, MCPErrorCodes } from './types.js';
import { MCPHandlers, createHandlers } from './handlers.js';

const DEFAULT_PORT = 3847;
const BUFFER_SIZE = 65536;

export interface MCPServerOptions {
  port?: number;
  host?: string;
  dataDir?: string;
}

export class MCPServer {
  private server: Server | null = null;
  private handlers: MCPHandlers;
  private port: number;
  private host: string;
  private connections: Set<any> = new Set();

  constructor(options: MCPServerOptions = {}) {
    this.port = options.port || DEFAULT_PORT;
    this.host = options.host || '127.0.0.1';
    this.handlers = createHandlers(options.dataDir);
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (err) => {
        console.error('MCP server error:', err);
        reject(err);
      });

      this.server.listen(this.port, this.host, () => {
        console.log(`MCP server listening on ${this.host}:${this.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      // Close all connections
      for (const conn of this.connections) {
        conn.destroy();
      }
      this.connections.clear();

      if (this.server) {
        this.server.close(() => {
          console.log('MCP server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private handleConnection(socket: any): void {
    this.connections.add(socket);
    let buffer = '';

    socket.on('data', async (data: Buffer) => {
      buffer += data.toString();

      // Process complete JSON-RPC messages
      const messages = this.parseMessages(buffer);
      buffer = messages.remaining;

      for (const message of messages.parsed) {
        try {
          const request = JSON.parse(message) as MCPRequest;
          const response = await this.handlers.handleRequest(request);
          socket.write(JSON.stringify(response) + '\n');
        } catch (error) {
          const errorResponse: MCPResponse = {
            jsonrpc: '2.0',
            id: null as any,
            error: {
              code: MCPErrorCodes.PARSE_ERROR,
              message: 'Invalid JSON',
            },
          };
          socket.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    });

    socket.on('close', () => {
      this.connections.delete(socket);
    });

    socket.on('error', (err: Error) => {
      console.error('Socket error:', err);
      this.connections.delete(socket);
    });
  }

  private parseMessages(buffer: string): { parsed: string[]; remaining: string } {
    const parsed: string[] = [];
    const lines = buffer.split('\n');
    
    // Last line might be incomplete
    const remaining = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        parsed.push(trimmed);
      }
    }

    return { parsed, remaining };
  }

  // Stdio transport for CLI integration
  static async startStdio(options: MCPServerOptions = {}): Promise<void> {
    const handlers = createHandlers(options.dataDir);
    let buffer = '';

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', async (chunk: string) => {
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const request = JSON.parse(trimmed) as MCPRequest;
          const response = await handlers.handleRequest(request);
          process.stdout.write(JSON.stringify(response) + '\n');
        } catch (error) {
          const errorResponse: MCPResponse = {
            jsonrpc: '2.0',
            id: null as any,
            error: {
              code: MCPErrorCodes.PARSE_ERROR,
              message: 'Invalid JSON',
            },
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    });

    process.stdin.on('end', () => {
      process.exit(0);
    });
  }
}

export function createMCPServer(options?: MCPServerOptions): MCPServer {
  return new MCPServer(options);
}

// CLI entry point
if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  const args = process.argv.slice(2);
  
  if (args.includes('--stdio')) {
    MCPServer.startStdio();
  } else {
    const portArg = args.find(a => a.startsWith('--port='));
    const port = portArg ? parseInt(portArg.split('=')[1], 10) : undefined;
    
    const server = createMCPServer({ port });
    server.start().catch((err) => {
      console.error('Failed to start MCP server:', err);
      process.exit(1);
    });
  }
}
