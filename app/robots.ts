import { MetadataRoute } from 'next'

// ИИ-краулеры и поисковые ассистенты, которым явно разрешён обход —
// нам нужна видимость и цитирование в ответах ИИ.
const aiBots = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',   // OpenAI / ChatGPT
  'PerplexityBot', 'Perplexity-User',           // Perplexity
  'ClaudeBot', 'Claude-SearchBot', 'anthropic-ai', // Anthropic / Claude
  'Google-Extended',                             // Gemini / AI Overviews
  'Applebot-Extended',                           // Apple Intelligence
  'Bingbot',                                     // Bing / Copilot
  'YandexBot', 'YandexAdditional',               // Яндекс Нейро / Поиск
  'CCBot',                                       // Common Crawl (датасеты LLM)
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...aiBots.map(userAgent => ({ userAgent, allow: '/' })),
    ],
    sitemap: 'https://clc-ufa.ru/sitemap.xml',
    host: 'https://clc-ufa.ru',
  }
}
