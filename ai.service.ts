import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY_MS = 5000; // 5 seconds base delay

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    const modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-2.0-flash-lite',
    );

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      this.logger.log(`Gemini AI initialized with ${modelName}`);
    } else {
      this.logger.warn('GEMINI_API_KEY not set — AI features will use fallback data');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRateLimitError(error: any): boolean {
    const message = error?.message || '';
    return message.includes('429') || message.includes('Too Many Requests') || message.includes('quota');
  }

  async generateJSON<T>(
    systemPrompt: string,
    userContext: string,
    fallback: T,
  ): Promise<T> {
    if (!this.model) {
      this.logger.warn('AI model not available, using fallback');
      return fallback;
    }

    const fullPrompt = `${systemPrompt}\n\n--- USER CONTEXT ---\n${userContext}\n\n--- INSTRUCTIONS ---\nRespond with ONLY valid JSON. No markdown, no code blocks, no extra text. Just the JSON object.`;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        // Clean the response — strip any markdown code blocks
        let cleaned = text.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.slice(7);
        }
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.slice(0, -3);
        }
        cleaned = cleaned.trim();

        const parsed = JSON.parse(cleaned) as T;
        return parsed;
      } catch (error) {
        if (this.isRateLimitError(error) && attempt < this.MAX_RETRIES) {
          const waitTime = this.BASE_DELAY_MS * Math.pow(2, attempt - 1); // 5s, 10s, 20s
          this.logger.warn(
            `Rate limited (attempt ${attempt}/${this.MAX_RETRIES}). Retrying in ${waitTime / 1000}s...`,
          );
          await this.delay(waitTime);
          continue;
        }

        this.logger.error(`AI generation failed: ${error.message}`);
        return fallback;
      }
    }

    return fallback;
  }
}

