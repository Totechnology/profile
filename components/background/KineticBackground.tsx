"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = `
  uniform float time;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float slow = sin((pos.x * 1.8 + time * 0.16) * 6.28318) * 0.012;
    float cross = sin((pos.x * 0.7 + pos.y * 1.35 - time * 0.11) * 6.28318) * 0.01;
    pos.z += slow + cross;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec3 surfaceTop;
  uniform vec3 surfaceBottom;
  uniform vec3 warmAccent;
  uniform vec3 coolAccent;
  uniform vec3 foam;
  varying vec2 vUv;

  float wave(vec2 uv, float scale, float speed, float bend) {
    float line = sin((uv.x * scale + sin(uv.y * bend + time * speed) * 0.18 + time * speed) * 6.28318);
    float cross = sin((uv.y * (scale * 0.72) - uv.x * 0.42 - time * speed * 0.68) * 6.28318);
    return line * 0.55 + cross * 0.45;
  }

  void main() {
    vec2 uv = vUv;
    float w1 = wave(uv + vec2(0.02, 0.0), 4.6, 0.045, 3.8);
    float w2 = wave(uv.yx + vec2(0.0, 0.06), 7.8, -0.032, 4.6);
    float w3 = wave(uv + vec2(sin(time * 0.06) * 0.03, 0.0), 12.0, 0.018, 6.2);

    float ripple = w1 * 0.45 + w2 * 0.34 + w3 * 0.21;
    float caustic = smoothstep(0.54, 0.95, ripple);
    float trough = smoothstep(-0.92, -0.18, -ripple);

    vec3 base = mix(surfaceTop, surfaceBottom, smoothstep(0.05, 1.0, uv.y));
    vec3 color = base;
    color = mix(color, warmAccent, max(w1, 0.0) * 0.08);
    color = mix(color, coolAccent, max(w2, 0.0) * 0.065);
    color = mix(color, foam, caustic * 0.18);
    color -= trough * 0.028;
    color += vec3(1.0) * smoothstep(0.78, 0.98, caustic) * 0.055;

    gl_FragColor = vec4(color, 0.92);
  }
`;

function WaterSurface() {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      surfaceTop: { value: new THREE.Color("#fbfaf6") },
      surfaceBottom: { value: new THREE.Color("#eee8dc") },
      warmAccent: { value: new THREE.Color("#c96442") },
      coolAccent: { value: new THREE.Color("#9c87f5") },
      foam: { value: new THREE.Color("#ffffff") }
    }),
    []
  );

  useFrame((state) => {
    uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 160, 160]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function BackgroundScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <WaterSurface />
    </>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function KineticBackground() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div aria-hidden className="kinetic-background kinetic-background-static" />;
  }

  return (
    <div aria-hidden className="kinetic-background">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <BackgroundScene />
      </Canvas>
    </div>
  );
}
