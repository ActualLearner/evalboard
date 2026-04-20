export const providerModels = {
  groq: [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'meta-llama/llama-4-scout-17b-16e-instruct',
  ],
  anthropic: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
  gemini: [
    'gemini-pro-latest',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite-preview',
  ],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  openai: [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-4.1-nano',
    'gpt-4.1-mini',
    'gpt-4.1',
    'gpt-5-nano',
    'gpt-5-mini',
    'gpt-5',
    'gpt-5.4-nano',
    'gpt-5.4-mini',
    'gpt-5.4',
    'o3-mini',
    'o3',
    'o4-mini',
  ],
}

export const geminiApiKeyRequiredModels = new Set([
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite-preview',
])
