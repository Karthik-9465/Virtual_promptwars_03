import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AIService } from '../services/ai';

const chatMessageSchema = z.object({
  message: z.string().min(1),
});

export class ChatController {
  public static async getHistory(req: any, res: Response) {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });

      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error fetching chat history' });
    }
  }

  public static async sendMessage(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { message } = chatMessageSchema.parse(req.body);

      // Fetch last 10 messages for conversation context
      const chatHistory = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Format history (reverse to chronological order)
      const formattedHistory = chatHistory
        .reverse()
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      // Generate AI response (will utilize Gemini or fallback heuristics)
      const aiResponseText = await AIService.generateChatResponse(
        userId,
        message,
        formattedHistory
      );

      // Save messages in database in a transaction
      const messages = await prisma.$transaction([
        prisma.chatMessage.create({
          data: { userId, sender: 'user', text: message },
        }),
        prisma.chatMessage.create({
          data: { userId, sender: 'assistant', text: aiResponseText },
        }),
      ]);

      res.json({
        userMessage: messages[0],
        aiResponse: messages[1],
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: err.message || 'Error sending chat message' });
    }
  }
}
