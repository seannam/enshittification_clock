// lib/ai/providers.ts
// Provider abstraction layer for multiple AI APIs

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AIProviderConfig } from './types';

export interface AIProvider {
  readonly name: string;
  readonly id: string;
  query(prompt: string): Promise<string>;
}

// OpenAI-compatible provider (works with OpenAI, Ollama, vLLM, etc.)
export class OpenAICompatibleProvider implements AIProvider {
  readonly name: string;
  readonly id: string;
  private client: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AIProviderConfig) {
    this.name = config.name;
    this.id = config.id;
    this.model = config.model;
    this.maxTokens = config.maxTokens;
    this.temperature = config.temperature;

    this.client = new OpenAI({
      baseURL: config.baseUrl,
      apiKey: config.apiKey,
    });
  }

  async query(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return content;
  }
}

// Native Anthropic provider
export class AnthropicProvider implements AIProvider {
  readonly name: string;
  readonly id: string;
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AIProviderConfig) {
    this.name = config.name;
    this.id = config.id;
    this.model = config.model;
    this.maxTokens = config.maxTokens;
    this.temperature = config.temperature;

    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async query(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Anthropic response');
    }

    return textContent.text;
  }
}

// Known Anthropic base URLs
const ANTHROPIC_URLS = [
  'https://api.anthropic.com',
  'api.anthropic.com',
];

// Factory function to create the appropriate provider
export function createProvider(config: AIProviderConfig): AIProvider {
  // Detect if this is an Anthropic provider based on base URL
  const isAnthropic = ANTHROPIC_URLS.some(
    (url) => config.baseUrl.includes(url) || config.baseUrl === ''
  );

  if (isAnthropic) {
    return new AnthropicProvider(config);
  }

  return new OpenAICompatibleProvider(config);
}

// Test provider connectivity by making a simple query
export async function testProviderConnection(config: AIProviderConfig): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> {
  const provider = createProvider(config);
  const startTime = Date.now();

  try {
    const response = await provider.query('Say "OK" and nothing else.');
    const latencyMs = Date.now() - startTime;

    if (response.toLowerCase().includes('ok')) {
      return {
        success: true,
        message: `Connection successful (${latencyMs}ms)`,
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Connection successful but unexpected response (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
