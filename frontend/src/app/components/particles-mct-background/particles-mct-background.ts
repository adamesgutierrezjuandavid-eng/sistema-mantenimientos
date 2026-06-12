import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  delay: number;
  color: string;
  targetX?: number;
  targetY?: number;
  startY?: number;
  waveAmplitude?: number;
  wavePhase?: number;
  isLetter: boolean;
}

@Component({
  selector: 'app-particles-mct-background',
  standalone: true,
  templateUrl: './particles-mct-background.html',
  styleUrls: ['./particles-mct-background.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticlesMctBackground implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId = 0;
  private width = 0;
  private height = 0;
  private frame = 0;
  private cardRect: DOMRect | null = null;
  private readonly floatingParticleCount = 92;
  private readonly connectionDistance = 58;
  private readonly lineOpacity = 0.06;
  private readonly cardGap = 18;
  private readonly floatingParticlePalette = [
    '248, 113, 113',
    '251, 191, 36',
    '56, 189, 248',
    '187, 247, 208',
    '192, 132, 252',
    '34, 197, 94',
    '14, 165, 233',
    '234, 179, 8'
  ];
  private readonly letterParticleColors = [
    '239, 68, 68',
    '245, 158, 11',
    '252, 211, 77'
  ];

  private readonly onResize = () => this.resize();

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;

    if (typeof window.CanvasRenderingContext2D === 'undefined') {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    this.ctx = ctx;

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize);
      this.resize();
      this.animate();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.animationFrameId);
  }

  private resize() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = Math.floor(this.width * dpr);
    canvas.height = Math.floor(this.height * dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.updateCardRect();
    this.createParticles();
  }

  private createParticles() {
    this.frame = 0;

    const particles: Particle[] = [];

    for (let i = 0; i < this.floatingParticleCount; i += 1) {
      particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: this.random(-0.12, 0.12),
        vy: this.random(-0.08, 0.08),
        radius: this.random(0.9, 2.1),
        alpha: this.random(0.18, 0.38),
        delay: 0,
        color: this.floatingParticlePalette[Math.floor(Math.random() * this.floatingParticlePalette.length)],
        isLetter: false
      });
    }

    this.particles = particles;
  }

  private createMctTargets() {
    const letterSize = Math.min(50, Math.max(32, this.width * 0.038));
    const letterWidth = letterSize * 0.82;
    const letterHeight = letterSize;
    const gap = letterSize * 0.68;
    const totalWidth = 3 * letterWidth + 2 * gap;
    const cardCenterX = this.cardRect ? this.cardRect.left + this.cardRect.width / 2 : this.width * 0.5;
    const startX = cardCenterX - totalWidth / 2;
    const baseY = this.cardRect
      ? this.cardRect.bottom + this.cardGap + letterHeight * 0.46
      : this.height * (this.width < 760 ? 0.62 : 0.54);
    const topY = baseY - letterHeight * 0.46;
    const bottomY = baseY + letterHeight * 0.46;
    const centerY = baseY;
    const targets: Array<{ x: number; y: number }> = [];

    const addStroke = (points: Array<{ x: number; y: number }>, density = 5) => {
      const segments = points.length - 1;
      for (let i = 0; i < segments; i += 1) {
        const start = points[i];
        const end = points[i + 1];
        const count = Math.max(density, Math.round(Math.hypot(end.x - start.x, end.y - start.y) / 10));
        this.getLinePoints(start.x, start.y, end.x, end.y, count).forEach((point) => {
          targets.push(point);
          if (Math.random() < 0.14) {
            targets.push({ x: point.x + this.random(-1.2, 1.2), y: point.y + this.random(-1.2, 1.2) });
          }
        });
      }
    };

    const leftLetterX = startX;
    const middleLetterX = startX + letterWidth + gap;
    const rightLetterX = startX + (letterWidth + gap) * 2;

    addStroke([
      { x: leftLetterX, y: bottomY },
      { x: leftLetterX, y: topY },
      { x: leftLetterX + letterWidth * 0.42, y: centerY },
      { x: leftLetterX + letterWidth * 0.9, y: topY },
      { x: leftLetterX + letterWidth, y: bottomY }
    ], 5);

    addStroke([
      { x: middleLetterX + letterWidth * 0.75, y: topY },
      { x: middleLetterX + letterWidth * 0.22, y: topY },
      { x: middleLetterX + letterWidth * 0.15, y: centerY },
      { x: middleLetterX + letterWidth * 0.22, y: bottomY },
      { x: middleLetterX + letterWidth * 0.75, y: bottomY }
    ], 5);

    addStroke([
      { x: rightLetterX, y: topY },
      { x: rightLetterX + letterWidth, y: topY }
    ], 4);
    addStroke([
      { x: rightLetterX + letterWidth * 0.5, y: topY },
      { x: rightLetterX + letterWidth * 0.5, y: bottomY }
    ], 4);

    return targets;
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackgroundGlow();
    this.drawMctLogo();
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawBackgroundGlow() {
    const gradient = this.ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.4,
      0,
      this.width * 0.5,
      this.height * 0.4,
      Math.max(this.width, this.height) * 0.8
    );

    gradient.addColorStop(0, 'rgba(30, 58, 138, 0.18)');
    gradient.addColorStop(0.18, 'rgba(56, 189, 248, 0.12)');
    gradient.addColorStop(0.45, 'rgba(15, 23, 42, 0.28)');
    gradient.addColorStop(0.78, 'rgba(10, 25, 47, 0.58)');
    gradient.addColorStop(1, 'rgba(2, 6, 23, 0.96)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private updateParticles() {
    this.frame += 1;

    for (const particle of this.particles) {
      if (particle.isLetter && particle.targetX !== undefined && particle.targetY !== undefined) {
        const convergeProgress = Math.min(Math.max((this.frame - particle.delay) / 64, 0), 1);
        const easeInOut = convergeProgress * convergeProgress * (3 - 2 * convergeProgress);

        if (this.frame < particle.delay) {
          particle.x += particle.vx;
          particle.y =
            (particle.startY ?? particle.y) +
            Math.sin((particle.x / this.width) * Math.PI * 2.4 + (particle.wavePhase ?? 0)) *
              (particle.waveAmplitude ?? 0) * 0.75;
          particle.alpha = Math.min(0.82, particle.alpha + 0.02);

          if (particle.x < -120) {
            particle.x = this.width + 120;
          }
          if (particle.x > this.width + 120) {
            particle.x = -120;
          }
        } else {
          const wave =
            (particle.waveAmplitude ?? 0) *
            Math.sin((particle.wavePhase ?? 0) + this.frame * 0.12) *
            (1 - easeInOut) * 0.28;
          const targetY = particle.targetY + wave;
          const targetX = particle.targetX;

          particle.vx += (targetX - particle.x) * 0.0062;
          particle.vy += (targetY - particle.y) * 0.0062;
          particle.vx *= 0.82;
          particle.vy *= 0.82;
          particle.x += (targetX - particle.x) * 0.014 * easeInOut;
          particle.y += (targetY - particle.y) * 0.014 * easeInOut;

          if (convergeProgress >= 1) {
            particle.x += Math.cos(this.frame * 0.1 + (particle.wavePhase ?? 0)) * 0.18;
            particle.y += Math.sin(this.frame * 0.12 + (particle.wavePhase ?? 0)) * 0.18;
          }

          particle.alpha = Math.min(0.92, particle.alpha + 0.014);
        }
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (!particle.isLetter) {
        if (particle.x < -20) particle.x = this.width + 20;
        if (particle.x > this.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = this.height + 20;
        if (particle.y > this.height + 20) particle.y = -20;
      }
    }
  }

  private drawConnections() {
    for (let i = 0; i < this.particles.length; i += 1) {
      for (let j = i + 1; j < this.particles.length; j += 1) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = a.isLetter && b.isLetter ? this.connectionDistance * 0.76 : 0;

        if (distance < maxDistance) {
          const revealOpacity = Math.min(a.alpha, b.alpha);
          const opacity =
            (1 - distance / maxDistance) *
            0.32 *
            revealOpacity;
          this.ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }
  }

  private drawParticles() {
    for (const particle of this.particles) {
      const alpha = particle.alpha * 0.94;
      if (particle.isLetter) {
        const size = Math.max(1.6, particle.radius);
        const rotation = (particle.wavePhase ?? 0) + this.frame * 0.04;

        this.ctx.save();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(rotation);
        this.ctx.shadowColor = `rgba(${particle.color}, ${alpha * 0.45})`;
        this.ctx.shadowBlur = size * 1.6;
        this.ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size * 0.65, 0);
        this.ctx.lineTo(0, size);
        this.ctx.lineTo(-size * 0.65, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.46, alpha)})`;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size * 0.45);
        this.ctx.lineTo(size * 0.35, 0);
        this.ctx.lineTo(0, size * 0.45);
        this.ctx.lineTo(-size * 0.35, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      } else {
        this.ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private drawMctLogo() {
    const letterSize = Math.min(72, Math.max(48, this.width * 0.05));
    const letterWidth = letterSize * 0.9;
    const gap = letterSize * 0.6;
    const totalWidth = 3 * letterWidth + 2 * gap;
    const cardCenterX = this.cardRect ? this.cardRect.left + this.cardRect.width / 2 : this.width * 0.5;
    const startX = cardCenterX - totalWidth / 2;
    const baseY = this.cardRect
      ? this.cardRect.bottom + this.cardGap + letterSize * 0.56
      : this.height * (this.width < 760 ? 0.62 : 0.54);
    const topY = baseY - letterSize * 0.52;
    const bottomY = baseY + letterSize * 0.52;
    const strokeWidth = letterSize * 0.26;
    const glowPhase = Math.sin(this.frame * 0.04) * (letterSize * 0.018);

    const primaryGradient = this.ctx.createLinearGradient(startX, topY, startX + totalWidth, bottomY);
    primaryGradient.addColorStop(0, 'rgba(14, 85, 188, 0.9)');
    primaryGradient.addColorStop(0.28, 'rgba(236, 240, 255, 0.96)');
    primaryGradient.addColorStop(0.52, 'rgba(255, 255, 255, 0.92)');
    primaryGradient.addColorStop(0.76, 'rgba(220, 38, 38, 0.94)');
    primaryGradient.addColorStop(1, 'rgba(15, 23, 42, 0.94)');

    // Soft halo behind letters
    this.ctx.save();
    const halo = this.ctx.createRadialGradient(cardCenterX, baseY, letterSize * 0.4, cardCenterX, baseY, letterSize * 1.9);
    halo.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    this.ctx.fillStyle = halo;
    this.ctx.fillRect(startX - letterSize * 0.7, topY - letterSize * 0.4, totalWidth + letterSize * 1.4, bottomY - topY + letterSize * 0.8);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = 'rgba(56, 189, 248, 0.22)';
    this.ctx.shadowBlur = 22;
    this.ctx.strokeStyle = primaryGradient;
    this.ctx.lineWidth = strokeWidth;

    // M
    this.ctx.beginPath();
    this.ctx.moveTo(startX, bottomY);
    this.ctx.lineTo(startX, topY + glowPhase);
    this.ctx.lineTo(startX + letterWidth * 0.33, baseY + glowPhase);
    this.ctx.lineTo(startX + letterWidth * 0.66, topY - glowPhase);
    this.ctx.lineTo(startX + letterWidth, bottomY);
    this.ctx.stroke();

    // C with clear terminals and open gap
    const middleX = startX + letterWidth + gap;
    const cRadius = letterWidth * 0.48;
    const cCenterX = middleX + letterWidth * 0.45;
    const cLeftX = middleX + letterWidth * 0.12;
    const cRightX = middleX + letterWidth * 0.82;
    const cTopY = topY + strokeWidth * 0.3;
    const cBottomY = bottomY - strokeWidth * 0.3;

    this.ctx.beginPath();
    this.ctx.moveTo(cRightX, cTopY);
    this.ctx.lineTo(cLeftX, cTopY);
    this.ctx.lineTo(cLeftX, cBottomY);
    this.ctx.lineTo(cRightX, cBottomY);
    this.ctx.stroke();

    // T
    const rightX = startX + 2 * (letterWidth + gap);
    this.ctx.beginPath();
    this.ctx.moveTo(rightX, topY);
    this.ctx.lineTo(rightX + letterWidth, topY);
    this.ctx.moveTo(rightX + letterWidth * 0.5, topY);
    this.ctx.lineTo(rightX + letterWidth * 0.5, bottomY);
    this.ctx.stroke();
    this.ctx.restore();

    // Hard edge accents
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    this.ctx.lineWidth = strokeWidth * 0.28;
    this.ctx.setLineDash([8, 12]);

    this.ctx.beginPath();
    this.ctx.moveTo(startX + strokeWidth * 0.18, bottomY - strokeWidth * 0.72);
    this.ctx.lineTo(startX + strokeWidth * 0.18, topY + strokeWidth * 0.92);
    this.ctx.lineTo(startX + letterWidth * 0.33, baseY + strokeWidth * 0.24);
    this.ctx.lineTo(startX + letterWidth * 0.66, topY + strokeWidth * 0.92);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(cCenterX, baseY, cRadius * 0.38, Math.PI * 0.26, Math.PI * 1.74, true);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(rightX + letterWidth * 0.5, topY + strokeWidth * 0.56);
    this.ctx.lineTo(rightX + letterWidth * 0.5, bottomY - strokeWidth * 1.0);
    this.ctx.stroke();
    this.ctx.restore();

    // Moving scan beam
    const barWidth = letterWidth * 0.12;
    const barX = startX + ((this.frame * 1.4) % (totalWidth + barWidth * 2)) - barWidth;
    const barGradient = this.ctx.createLinearGradient(barX, topY, barX + barWidth, bottomY);
    barGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    barGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
    barGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.ctx.save();
    this.ctx.fillStyle = barGradient;
    this.ctx.fillRect(barX, topY, barWidth, bottomY - topY);
    this.ctx.restore();

    // Precision nodes and connector lines
    const nodeSize = Math.max(3.2, letterSize * 0.082);
    const nodes = [
      { x: startX + letterWidth * 0.12, y: topY + nodeSize * 1.6 },
      { x: startX + letterWidth * 0.92, y: bottomY - nodeSize * 1.8 },
      { x: cCenterX + letterWidth * 0.16, y: topY + nodeSize * 1.15 },
      { x: rightX + letterWidth * 0.52, y: baseY + nodeSize * 0.32 }
    ];

    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.96)';
    nodes.forEach((node) => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(startX + letterWidth * 0.18, topY + nodeSize * 1.4);
    this.ctx.lineTo(startX + letterWidth * 0.44, topY + nodeSize * 1.0);
    this.ctx.lineTo(cCenterX + letterWidth * 0.16, topY + nodeSize * 1.3);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(startX + letterWidth * 0.92, bottomY - nodeSize * 1.6);
    this.ctx.lineTo(rightX + letterWidth * 0.44, baseY + nodeSize * 0.36);
    this.ctx.stroke();
    this.ctx.restore();

    // Digital frame
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([14, 10]);
    const frameX = startX - strokeWidth * 0.8;
    const frameY = topY - strokeWidth * 0.9;
    const frameW = totalWidth + strokeWidth * 1.6;
    const frameH = bottomY - topY + strokeWidth * 1.8;
    this.ctx.strokeRect(frameX, frameY, frameW, frameH);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    const notchSize = strokeWidth * 0.9;
    [[frameX + notchSize, frameY], [frameX + frameW - notchSize * 2, frameY], [frameX + notchSize, frameY + frameH - notchSize], [frameX + frameW - notchSize * 2, frameY + frameH - notchSize]].forEach(([x, y]) => {
      this.ctx.fillRect(x, y, notchSize, notchSize * 0.35);
    });
    this.ctx.restore();
  }

  private getLinePoints(x1: number, y1: number, x2: number, y2: number, count: number) {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
    }
    return points;
  }

  private getArcPoints(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, count: number) {
    const points: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= count; i += 1) {
      const angle = startAngle + ((endAngle - startAngle) * i) / count;
      points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    return points;
  }

  private updateCardRect() {
    const card = document.querySelector<HTMLDivElement>('.login-card');
    this.cardRect = card ? card.getBoundingClientRect() : null;
  }

  private random(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
}
