import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface AiTool {
  name: string;
  icon: string;
  color: string;
}

interface AiProject {
  title: string;
  desc: string;
  tags: string[];
  icon: string;
}

@Component({
  selector: 'app-ai-engineer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ai-engineer.component.html',
  styleUrl: './ai-engineer.component.css'
})
export class AiEngineerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('neuralCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationFrameId = 0;
  private nodes: { x: number; y: number; vx: number; vy: number; r: number; pulse: number }[] = [];
  private readonly NODE_COUNT = 60;

  tools: AiTool[] = [
    { name: 'Python', icon: '🐍', color: '#3b82f6' },
    { name: 'TensorFlow', icon: '🧠', color: '#f59e0b' },
    { name: 'Groq API', icon: '⚡', color: '#8b5cf6' },
    { name: 'Semantic Kernel', icon: '🔗', color: '#06b6d4' },
    { name: 'OpenAI API', icon: '🤖', color: '#10b981' },
    { name: 'Hugging Face', icon: '🤗', color: '#f97316' },
    { name: 'FastAPI', icon: '🚀', color: '#6366f1' },
    { name: 'Prompt Eng.', icon: '✨', color: '#ec4899' },
  ];

  projects: AiProject[] = [
    {
      title: 'Marshell — AI Portfolio Chatbot',
      desc: 'A conversational AI assistant embedded in this portfolio, powered by Groq API with ultra-fast inference. Marshell answers questions about my skills, projects, and experience in real-time.',
      tags: ['Groq API', 'Angular', 'LLM', 'RAG'],
      icon: '🤖'
    },
    {
      title: 'Intelligent Document QA System',
      desc: 'Built a document question-answering pipeline using Semantic Kernel and vector embeddings that extracts meaningful answers from unstructured PDF documents.',
      tags: ['Semantic Kernel', 'FAISS', 'Python', 'Embeddings'],
      icon: '📄'
    },
    {
      title: 'AI-Powered Help Support System',
      desc: 'Integrated AI triage logic into a help desk platform that auto-categorizes support tickets and suggests resolutions using NLP classification.',
      tags: ['NLP', 'Angular', '.NET', 'Classification'],
      icon: '🎯'
    },
  ];

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initCanvas();
      this.spawnNodes();
      this.animate();
      window.addEventListener('resize', this.onResize.bind(this));
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize(canvas);
  }

  private resize(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private onResize(): void {
    this.resize(this.canvasRef.nativeElement);
    this.spawnNodes();
  }

  private spawnNodes(): void {
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.nodes = Array.from({ length: this.NODE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1.5,
      pulse: Math.random() * Math.PI * 2
    }));
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    const canvas = this.canvasRef.nativeElement;
    const W = canvas.width;
    const H = canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, W, H);

    // Move nodes
    for (const n of this.nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += 0.02;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    // Draw connections
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const alpha = (1 - dist / 140) * 0.35;
          const grad = ctx.createLinearGradient(
            this.nodes[i].x, this.nodes[i].y,
            this.nodes[j].x, this.nodes[j].y
          );
          grad.addColorStop(0, `rgba(139, 92, 246, ${alpha})`);
          grad.addColorStop(1, `rgba(59, 130, 246, ${alpha})`);
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.8;
          ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
          ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const n of this.nodes) {
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3);
      const pulse = 0.6 + Math.sin(n.pulse) * 0.4;
      glow.addColorStop(0, `rgba(167, 139, 250, ${pulse})`);
      glow.addColorStop(1, `rgba(139, 92, 246, 0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196, 181, 253, ${pulse})`;
      ctx.fill();
    }
  }
}
