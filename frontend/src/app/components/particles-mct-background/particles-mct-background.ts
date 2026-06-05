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
  targetX?: number;
  targetY?: number;
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
  private readonly floatingParticleCount = 70;
  private readonly connectionDistance = 115;
  private readonly lineOpacity = 0.16;
  private readonly letterParticleColor = 'rgba(125, 211, 252, 0.88)';
  private readonly floatingParticleColor = 'rgba(226, 232, 240, 0.62)';

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

    this.createParticles();
  }

  private createParticles() {
    const letterTargets = this.createMctTargets();
    const particles: Particle[] = letterTargets.map((target) => ({
      x: target.x + this.random(-80, 80),
      y: target.y + this.random(-70, 70),
      vx: this.random(-0.18, 0.18),
      vy: this.random(-0.18, 0.18),
      radius: this.random(1.4, 2.6),
      targetX: target.x,
      targetY: target.y,
      isLetter: true
    }));

    for (let i = 0; i < this.floatingParticleCount; i += 1) {
      particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: this.random(-0.24, 0.24),
        vy: this.random(-0.24, 0.24),
        radius: this.random(1, 2.1),
        isLetter: false
      });
    }

    this.particles = particles;
  }

  private createMctTargets() {
    const letters = [
      ['1...1', '11.11', '1.1.1', '1...1', '1...1', '1...1', '1...1'],
      ['.1111', '1....', '1....', '1....', '1....', '1....', '.1111'],
      ['11111', '..1..', '..1..', '..1..', '..1..', '..1..', '..1..']
    ];
    const cell = Math.max(9, Math.min(this.width, this.height) * 0.018);
    const gap = cell * 2.4;
    const letterWidth = 5 * cell;
    const totalWidth = letters.length * letterWidth + (letters.length - 1) * gap;
    const startX = this.width * 0.52 - totalWidth / 2;
    const startY = this.height * 0.48 - (7 * cell) / 2;
    const targets: Array<{ x: number; y: number }> = [];

    letters.forEach((rows, letterIndex) => {
      const offsetX = startX + letterIndex * (letterWidth + gap);

      rows.forEach((row, rowIndex) => {
        [...row].forEach((value, columnIndex) => {
          if (value === '1') {
            targets.push({
              x: offsetX + columnIndex * cell,
              y: startY + rowIndex * cell
            });
          }
        });
      });
    });

    return targets;
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackgroundGlow();
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawBackgroundGlow() {
    const gradient = this.ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.45,
      0,
      this.width * 0.5,
      this.height * 0.45,
      Math.max(this.width, this.height) * 0.8
    );

    gradient.addColorStop(0, 'rgba(14, 116, 144, 0.18)');
    gradient.addColorStop(0.42, 'rgba(15, 23, 42, 0.42)');
    gradient.addColorStop(1, 'rgba(2, 6, 23, 0.92)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private updateParticles() {
    for (const particle of this.particles) {
      if (particle.isLetter && particle.targetX !== undefined && particle.targetY !== undefined) {
        particle.vx += (particle.targetX - particle.x) * 0.0015;
        particle.vy += (particle.targetY - particle.y) * 0.0015;
        particle.vx *= 0.94;
        particle.vy *= 0.94;
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
        const maxDistance = a.isLetter && b.isLetter ? this.connectionDistance * 0.72 : this.connectionDistance;

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * this.lineOpacity;
          this.ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
          this.ctx.lineWidth = a.isLetter && b.isLetter ? 0.9 : 0.55;
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
      this.ctx.fillStyle = particle.isLetter ? this.letterParticleColor : this.floatingParticleColor;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private random(min: number, max: number) {
    return min + Math.random() * (max - min);
  }
}
