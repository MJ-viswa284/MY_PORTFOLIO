import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import OpenAI from 'openai';
import emailjs from '@emailjs/browser';

import { environment } from '../../../environments/environment';

interface ChatMessage {
  text: string;
  sender: 'bot' | 'user';
  isTyping?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  isOpen = false;
  showGreeting = false;
  isTyping = false;
  messages: ChatMessage[] = [];
  userInput = '';

  // Groq Configuration (Primary Brain)
  private groq = new OpenAI({
    apiKey: environment.groqApiKey || 'dummy_key',
    baseURL: (typeof window !== 'undefined' ? window.location.origin : '') + '/api-groq/v1',
    dangerouslyAllowBrowser: true
  });
  private primaryGroqModel = 'llama-3.3-70b-versatile';
  
  // History for Groq
  private groqHistory: any[] = [
    { 
      role: 'system', 
      content: `You are Marshell, a super friendly, energetic, and casual AI buddy for Viswa's developer portfolio. You love hyping up Viswa! Viswa is an awesome AI Engineer and Full Stack Developer at E2O Technologies, and formerly at Pencil Walk. He rocks at AI Development, LLMs, Client-side proxying, Angular, .NET, ReactJS, Node.js, MongoDB, MySQL, Three.js, and Tailwind CSS. He built cool stuff like the On-Call Acting Driver App, E-commerce sites, CRM Systems, and Kavi Travels. Chat like a close friend, use emojis, keep it light, fun, and conversational! Never sound like a boring robot.

IMPORTANT RULES:
1. KEEP RESPONSES SHORT & CONCISE: Limit all responses to a maximum of 2-3 sentences. Keep them snappy and save tokens.
2. AI ENGINEER: Highlight that Viswa is now an AI Engineer!
3. EMAIL TOOL: Only call the 'sendEmail' tool when you have collected all three required parameters: name, email, and message.
4. PERSONAL FINANCE: Never disclose Viswa's salary or personal financial details under any circumstances.`
    }
  ];

  ngOnInit() {
    this.messages = [
      { text: "Hey! I'm Marshell, Viswa's AI assistant. Ask me anything about his skills, experience, or projects!", sender: 'bot' }
    ];

    setTimeout(() => {
      if (!this.isOpen) {
        this.showGreeting = true;
      }
    }, 2000);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.showGreeting = false;
    }
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;
    
    const text = this.userInput;
    this.messages.push({ text: text, sender: 'user' });
    this.userInput = '';
    this.isTyping = true;
    this.scrollToBottom();
    
    try {
      await this.handleGroqMessage(text);
    } catch (error: any) {
      console.error('Chat error:', error);
      this.messages.push({ text: "Sorry brother, my brain is a bit scrambled right now. Try again in a second! 😅", sender: 'bot' });
    } finally {
      this.isTyping = false;
    }
  }

  private async handleGroqMessage(text: string) {
    this.groqHistory.push({ role: 'user', content: text });

    const tools: any[] = [{
      type: 'function',
      function: {
        name: 'sendEmail',
        description: 'Sends an email to Viswa. Use ONLY when name, email, and message are all known.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            message: { type: 'string' }
          },
          required: ['name', 'email', 'message']
        }
      }
    }];

    const response = await this.groq.chat.completions.create({
      model: this.primaryGroqModel,
      messages: this.groqHistory,
      tools: tools,
      tool_choice: 'auto',
      max_tokens: 200
    });

    const choice = response.choices[0].message;
    
    if (choice.tool_calls && choice.tool_calls.length > 0) {
      const toolCall: any = choice.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);
      
      this.messages.push({ text: "Sending your message to Viswa... ✉️🚀", sender: 'bot' });
      this.scrollToBottom();

      try {
        emailjs.init('MSoYy-x1WG6Bl8Qz5');
        await emailjs.send('service_34vpspb', 'template_7yb4zhd', {
          from_name: args.name,
          from_email: args.email,
          message: args.message
        });

        // Tell Groq it succeeded
        this.groqHistory.push(choice);
        this.groqHistory.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: 'sendEmail',
          content: 'Success! Email delivered.'
        });

        const secondRes = await this.groq.chat.completions.create({
          model: this.primaryGroqModel,
          messages: this.groqHistory,
          max_tokens: 200
        });

        this.addBotMessage(secondRes.choices[0].message.content || 'Done! Sent it! ✅');
      } catch (err) {
        this.addBotMessage("Ah, something went wrong with the email. Can you try again later? 😅");
      }
    } else {
      this.addBotMessage(choice.content || '');
    }
  }

  private addBotMessage(text: string) {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    this.messages.push({ text: formatted, sender: 'bot' });
    this.groqHistory.push({ role: 'assistant', content: text });
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if(this.chatBody && this.chatBody.nativeElement) {
          this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
        }
      } catch(err) { }
    }, 50);
  }
}
