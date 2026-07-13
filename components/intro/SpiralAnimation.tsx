"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

class Vector2D {
  constructor(
    public x: number,
    public y: number
  ) {}
}

class Vector3D {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}
}

function seededRandom(seed = 1234) {
  let current = seed;
  return () => {
    current = (current * 9301 + 49297) % 233280;
    return current / 233280;
  };
}

type ControllerOptions = {
  durationMs: number;
  starCount: number;
  trailLength: number;
  onComplete?: () => void;
};

class AnimationController {
  private timeline: gsap.core.Timeline;
  private time = 0;
  private stars: Star[] = [];
  private readonly changeEventTime = 0.32;
  private readonly cameraZ = -400;
  private readonly cameraTravelDistance = 3400;
  private readonly startDotYOffset = 28;
  private readonly viewZoom = 100;
  private readonly random = seededRandom();

  constructor(
    private canvas: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    private width: number,
    private height: number,
    private options: ControllerOptions
  ) {
    this.stars = Array.from({ length: options.starCount }, () => new Star(this));
    this.timeline = gsap.timeline({
      onComplete: options.onComplete
    });

    this.timeline.to(this, {
      time: 1,
      duration: options.durationMs / 1000,
      ease: "none",
      onUpdate: () => this.render()
    });

    this.render();
  }

  public rand(min: number, max: number) {
    return min + this.random() * (max - min);
  }

  public getCameraZ() {
    return this.cameraZ;
  }

  public getCameraTravelDistance() {
    return this.cameraTravelDistance;
  }

  public ease(p: number, g: number): number {
    if (p < 0.5) return 0.5 * Math.pow(2 * p, g);
    return 1 - 0.5 * Math.pow(2 * (1 - p), g);
  }

  public easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 4.5;
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
  }

  public map(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  public constrain(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  public lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
  }

  public spiralPath(p: number): Vector2D {
    const progress = this.ease(this.constrain(1.2 * p, 0, 1), 1.8);
    const numberOfSpiralTurns = 6;
    const theta = 2 * Math.PI * numberOfSpiralTurns * Math.sqrt(progress);
    const radius = 170 * Math.sqrt(progress);

    return new Vector2D(
      radius * Math.cos(theta),
      radius * Math.sin(theta) + this.startDotYOffset
    );
  }

  public rotate(v1: Vector2D, v2: Vector2D, p: number, orientation: boolean): Vector2D {
    const middle = new Vector2D((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);
    const dx = v1.x - middle.x;
    const dy = v1.y - middle.y;
    const angle = Math.atan2(dy, dx);
    const orientationDirection = orientation ? -1 : 1;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p);

    return new Vector2D(
      middle.x + radius * (1 + bounce) * Math.cos(angle + orientationDirection * Math.PI * this.easeOutElastic(p)),
      middle.y + radius * (1 + bounce) * Math.sin(angle + orientationDirection * Math.PI * this.easeOutElastic(p))
    );
  }

  public toWorldPosition(screenX: number, screenY: number, z: number) {
    const vx = ((z - this.cameraZ) * screenX) / this.viewZoom;
    const vy = ((z - this.cameraZ) * screenY) / this.viewZoom;
    return new Vector3D(vx, vy, z);
  }

  public showProjectedDot(position: Vector3D, sizeFactor: number) {
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    const newCameraZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance;

    if (position.z > newCameraZ) {
      const dotDepthFromCamera = position.z - newCameraZ;
      const x = (this.viewZoom * position.x) / dotDepthFromCamera;
      const y = (this.viewZoom * position.y) / dotDepthFromCamera;
      const size = Math.max(0.28, (230 * sizeFactor) / dotDepthFromCamera);

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawStartDot() {
    if (this.time > this.changeEventTime) {
      const dy = (this.cameraZ * this.startDotYOffset) / this.viewZoom;
      const position = new Vector3D(0, dy, this.cameraTravelDistance);
      this.showProjectedDot(position, 2.8);
    }
  }

  private drawTrail(t1: number) {
    for (let i = 0; i < this.options.trailLength; i += 1) {
      const factor = this.map(i, 0, this.options.trailLength, 1.1, 0.1);
      const size = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * factor;
      const pathTime = t1 - 0.00015 * i;
      const position = this.spiralPath(pathTime);
      const rotated = this.rotate(
        position,
        new Vector2D(position.x + 5, position.y + 5),
        Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5,
        i % 2 === 0
      );

      this.ctx.fillStyle = `rgba(245, 247, 250, ${0.42 + factor * 0.42})`;
      this.ctx.beginPath();
      this.ctx.arc(rotated.x, rotated.y, Math.max(0.2, size / 2), 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  public render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1);
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);

    ctx.rotate(-Math.PI * this.ease(t2, 2.7));
    this.drawTrail(t1);

    ctx.fillStyle = "rgba(245, 247, 250, 0.92)";
    for (const star of this.stars) {
      star.render(t1, this);
    }

    this.drawStartDot();
    ctx.restore();
  }

  public completeNow() {
    this.timeline.progress(1);
  }

  public destroy() {
    this.timeline.kill();
  }
}

class Star {
  private dx: number;
  private dy: number;
  private spiralLocation: number;
  private strokeWeightFactor: number;
  private z: number;
  private angle: number;
  private distance: number;
  private rotationDirection: number;
  private expansionRate: number;
  private finalScale: number;

  constructor(controller: AnimationController) {
    this.angle = controller.rand(0, Math.PI * 2);
    this.distance = 15 + controller.rand(0, 30);
    this.rotationDirection = controller.rand(0, 1) > 0.5 ? 1 : -1;
    this.expansionRate = 1.2 + controller.rand(0, 0.8);
    this.finalScale = 0.7 + controller.rand(0, 0.6);
    this.dx = this.distance * Math.cos(this.angle);
    this.dy = this.distance * Math.sin(this.angle);
    this.spiralLocation = (1 - Math.pow(1 - controller.rand(0, 1), 3.0)) / 1.3;
    this.z = controller.rand(
      0.5 * controller.getCameraZ(),
      controller.getCameraTravelDistance() + controller.getCameraZ()
    );
    this.z = controller.lerp(this.z, controller.getCameraTravelDistance() / 2, 0.3 * this.spiralLocation);
    this.strokeWeightFactor = Math.pow(controller.rand(0, 1), 2.0);
  }

  render(p: number, controller: AnimationController) {
    const spiralPos = controller.spiralPath(this.spiralLocation);
    const q = p - this.spiralLocation;
    if (q <= 0) return;

    const displacementProgress = controller.constrain(4 * q, 0, 1);
    const linearEasing = displacementProgress;
    const elasticEasing = controller.easeOutElastic(displacementProgress);
    const powerEasing = Math.pow(displacementProgress, 2);

    let easing: number;
    if (displacementProgress < 0.3) {
      easing = controller.lerp(linearEasing, powerEasing, displacementProgress / 0.3);
    } else if (displacementProgress < 0.7) {
      easing = controller.lerp(powerEasing, elasticEasing, (displacementProgress - 0.3) / 0.4);
    } else {
      easing = elasticEasing;
    }

    let screenX: number;
    let screenY: number;

    if (displacementProgress < 0.3) {
      screenX = controller.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3);
      screenY = controller.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3);
    } else if (displacementProgress < 0.7) {
      const midProgress = (displacementProgress - 0.3) / 0.4;
      const curveStrength = Math.sin(midProgress * Math.PI) * this.rotationDirection * 1.5;
      const baseX = spiralPos.x + this.dx * 0.3;
      const baseY = spiralPos.y + this.dy * 0.3;
      const targetX = spiralPos.x + this.dx * 0.7;
      const targetY = spiralPos.y + this.dy * 0.7;
      const perpX = -this.dy * 0.4 * curveStrength;
      const perpY = this.dx * 0.4 * curveStrength;

      screenX = controller.lerp(baseX, targetX, midProgress) + perpX * midProgress;
      screenY = controller.lerp(baseY, targetY, midProgress) + perpY * midProgress;
    } else {
      const finalProgress = (displacementProgress - 0.7) / 0.3;
      const baseX = spiralPos.x + this.dx * 0.7;
      const baseY = spiralPos.y + this.dy * 0.7;
      const targetDistance = this.distance * this.expansionRate * 1.5;
      const spiralTurns = 1.2 * this.rotationDirection;
      const spiralAngle = this.angle + spiralTurns * finalProgress * Math.PI;
      const targetX = spiralPos.x + targetDistance * Math.cos(spiralAngle);
      const targetY = spiralPos.y + targetDistance * Math.sin(spiralAngle);

      screenX = controller.lerp(baseX, targetX, finalProgress);
      screenY = controller.lerp(baseY, targetY, finalProgress);
    }

    const position = controller.toWorldPosition(screenX, screenY, this.z);
    const sizeMultiplier =
      displacementProgress < 0.6
        ? 1.0 + displacementProgress * 0.2
        : 1.2 * (1.0 - (displacementProgress - 0.6) / 0.4) +
          this.finalScale * ((displacementProgress - 0.6) / 0.4);

    controller.showProjectedDot(position, 8.5 * this.strokeWeightFactor * sizeMultiplier);
  }
}

function getParticleSettings(width: number) {
  if (width < 640) return { starCount: 1200, trailLength: 48 };
  if (width < 1024) return { starCount: 2200, trailLength: 64 };
  if (width > 1500) return { starCount: 4400, trailLength: 86 };
  return { starCount: 3400, trailLength: 78 };
}

export function SpiralAnimation({
  onComplete,
  durationMs = 5600
}: {
  onComplete?: () => void;
  durationMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<AnimationController | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let frame = 0;

    const updateDimensions = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width || !dimensions.height) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(dimensions.width * dpr);
    canvas.height = Math.floor(dimensions.height * dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const settings = getParticleSettings(dimensions.width);
    animationRef.current?.destroy();
    animationRef.current = new AnimationController(canvas, ctx, dimensions.width, dimensions.height, {
      durationMs,
      starCount: settings.starCount,
      trailLength: settings.trailLength,
      onComplete
    });

    return () => {
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [dimensions, durationMs, onComplete]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
