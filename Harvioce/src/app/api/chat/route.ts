import { groq } from '@ai-sdk/groq';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq('llama3-70b-8192'),
    system: 'You are Harvoice, an AI assistant for B2B lead generation. Use tools to show data to the user.',
    messages,
    tools: {
      // Tool 1: Pull up a lead to update the Left Panel
      fetchLead: tool({
        description: 'Fetch a lead profile and display it in the data intelligence panel',
        parameters: z.object({
          name: z.string().describe('The name of the company or contact to look up'),
        }),
        execute: async ({ name }) => {
          // Here you would query your Supabase DB via Prisma
          // For now, we return mock data that the frontend will catch
          return {
            id: '123',
            name,
            score: 92,
            phone: '+966 50 123 4567',
            email: 'contact@example.com',
          };
        },
      }),

      // Tool 2: Draft a message to update the Right Panel
      draftMessage: tool({
        description: 'Draft an outreach message for a lead',
        parameters: z.object({
          target: z.string(),
          channel: z.enum(['email', 'linkedin', 'whatsapp']),
          context: z.string(),
        }),
        execute: async ({ target, channel, context }) => {
          // Here you could call Gemini/Vertex to write the actual copy
          return {
            target,
            channel,
            content: `Drafted ${channel} message for ${target} based on: ${context}`,
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
