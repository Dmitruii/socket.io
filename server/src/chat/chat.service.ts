import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  private messageCount: Map<string, number> = new Map();
  private lastMessageTime: Map<string, Date> = new Map();

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessage(user: string, text: string): Promise<Message> {
    const message = this.messageRepository.create({
      user,
      text,
      timestamp: new Date(),
    });
    await this.messageRepository.save(message);

    const count = (this.messageCount.get(user) || 0) + 1;
    this.messageCount.set(user, count);
    this.lastMessageTime.set(user, new Date());

    return message;
  }

  async getMessages(): Promise<Message[]> {
    return this.messageRepository.find({
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }

  async canSendMessage(user: string): Promise<boolean> {
    const lastTime = this.lastMessageTime.get(user);
    const count = this.messageCount.get(user) || 0;

    if (!lastTime || new Date().getTime() - lastTime.getTime() > 5000) {
      this.messageCount.set(user, 0);
      return true;
    }

    return count < 5;
  }
}
