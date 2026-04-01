'use client'

import React, { useRef, useEffect, useCallback } from 'react'

/**
 * WebGLCanvas — GPU-accelerated animated gradient mesh background.
 * Uses raw WebGL for smooth, performant organic fluid animation.
 */

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;

  // Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time * 0.15;
    
    // Multi-layer organic noise
    float n1 = snoise(uv * 2.0 + vec2(t * 0.3, t * 0.2)) * 0.5 + 0.5;
    float n2 = snoise(uv * 3.5 + vec2(-t * 0.2, t * 0.4)) * 0.5 + 0.5;
    float n3 = snoise(uv * 1.5 + vec2(t * 0.1, -t * 0.15)) * 0.5 + 0.5;
    
    // Blend colors with noise
    vec3 col = mix(u_color1, u_color2, n1);
    col = mix(col, u_color3, n2 * 0.4);
    col += n3 * 0.03;
    
    // Vignette
    float vignette = 1.0 - length((uv - 0.5) * 1.2);
    vignette = smoothstep(0.0, 0.7, vignette);
    col *= (0.85 + vignette * 0.15);
    
    gl_FragColor = vec4(col, 1.0);
  }
`

interface WebGLCanvasProps {
  className?: string
  color1?: [number, number, number]
  color2?: [number, number, number]
  color3?: [number, number, number]
  opacity?: number
}

const WebGLCanvas: React.FC<WebGLCanvasProps> = ({
  className = '',
  color1 = [1.0, 1.0, 1.0],   // #ffffff white
  color2 = [0.76, 0.64, 0.37],    // #C3A35E (gold)
  color3 = [0.42, 0.12, 0.17],    // #6B1F2B (burgundy)
  opacity = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, preserveDrawingBuffer: false })
    if (!gl) return null

    // Compile shaders
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(VERTEX_SHADER, gl.VERTEX_SHADER)
    const fs = compileShader(FRAGMENT_SHADER, gl.FRAGMENT_SHADER)
    if (!vs || !fs) return null

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return null
    }

    gl.useProgram(program)

    // Full-screen quad
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    return {
      gl,
      program,
      uniforms: {
        time: gl.getUniformLocation(program, 'u_time'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        color1: gl.getUniformLocation(program, 'u_color1'),
        color2: gl.getUniformLocation(program, 'u_color2'),
        color3: gl.getUniformLocation(program, 'u_color3'),
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5) // Cap for performance
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()

    const ctx = initWebGL()
    if (!ctx) return

    const { gl, uniforms } = ctx
    startTimeRef.current = Date.now()

    gl.uniform3f(uniforms.color1, color1[0], color1[1], color1[2])
    gl.uniform3f(uniforms.color2, color2[0], color2[1], color2[2])
    gl.uniform3f(uniforms.color3, color3[0], color3[1], color3[2])

    const render = () => {
      resize()
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform1f(uniforms.time, (Date.now() - startTimeRef.current) / 1000)
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }
    render()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [initWebGL, color1, color2, color3])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity }}
    />
  )
}

export default WebGLCanvas
