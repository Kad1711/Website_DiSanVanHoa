import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeritageDust3D
 * Hiệu ứng bụi sao / than hồng di sản nhẹ nhàng (Ambient Heritage Stardust):
 * Phù hợp làm nền cho phần Banner chi tiết tác phẩm (WorkDetailPage) hoặc các khung giới thiệu.
 * Tinh tế, không gây nhiễu mắt hay cản trở việc đọc chữ.
 */
const HeritageDust3D = ({ count = 50, color = '#f59e0b', className = '' }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      if (!window.WebGLRenderingContext || (!testCanvas.getContext('webgl') && !testCanvas.getContext('experimental-webgl'))) {
        return;
      }
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.z = 5;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const ctx = pCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(pCanvas);

    const positions = new Float32Array(count * 3);
    const speeds = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      speeds.push({
        y: 0.002 + Math.random() * 0.005,
        x: (Math.random() - 0.5) * 0.002,
        sway: Math.random() * Math.PI * 2,
      });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.2,
      map: texture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let frameId;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();
      const posAttr = geometry.attributes.position;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const sp = speeds[i];

        let y = posAttr.getY(idx) + sp.y;
        let x = posAttr.getX(idx) + sp.x + Math.sin(elapsed * 1.5 + sp.sway) * 0.002;

        if (y > 3) y = -3;

        posAttr.setX(idx, x);
        posAttr.setY(idx, y);
      }
      posAttr.needsUpdate = true;

      try {
        renderer.render(scene, camera);
      } catch {
        cancelAnimationFrame(frameId);
      }
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [count, color]);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};

export default HeritageDust3D;
