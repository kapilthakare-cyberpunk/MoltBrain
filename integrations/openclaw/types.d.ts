// Temporary type definitions for openclaw plugin-sdk
declare module "openclaw/plugin-sdk" {
  import { Static, TSchema } from "@sinclair/typebox";

  export interface OpenClawPluginApi {
    registerTool(tool: any, options?: any): void;
    // Add other API methods as needed
  }

  export interface PluginConfigSchema {
    // Define the schema structure
  }

  export function emptyPluginConfigSchema(): PluginConfigSchema;

  // Export any other types that are needed
  export type { Static, TSchema };
}