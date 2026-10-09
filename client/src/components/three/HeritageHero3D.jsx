import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeritageHero3D
 * Hiệu ứng Three.js 3D tinh tế cho phần Hero trang chủ:
 * - Dải sóng núi & sông quê hương uốn lượn êm đềm (Wireframe/Point Wave).
 * - Tinh hoa di sản / Đom đóm đêm trăng (Glowing golden embers) bay bổng nhẹ nhàng.
 * - Vòng Nhật Nguyệt / Vòng Ngân Hà (Celestial particle halo) xoay chậm trong không gian.
 * - Tương tác chuột chuyển động thị sai (Parallax) êm dịu, không giật lắc, không làm lóa chữ.
 */
const HeritageHero3D = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Kiểm tra hỗ trợ WebGL
    try {
      const testCanvas = document.createElement('canvas');
      if (!window.WebGLRenderingContext || (!testCanvas.getContext('webgl') && !testCanvas.getContext('experimental-webgl'))) {
        return;
      }
    } catch {
      return;
    }

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.2, 8);

    const isMobile = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0); // Trong suốt
      container.appendChild(renderer.domElement);
    } catch {
      return; // Safe fallback: không render gì nếu WebGL crash, giữ nguyên ảnh nền tĩnh
    }

    // --- Tạo Texture hạt phát sáng mềm mịn (Glowing circular dot) ---
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(251, 191, 36, 0.85)'); // Amber gold
      gradient.addColorStop(0.55, 'rgba(217, 119, 6, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const particleTexture = createParticleTexture();

    // --- 1. Dải Núi & Dòng Sông Đại Ngàn (Flowing Terrain Wave) ---
    const waveCols = isMobile ? 30 : 44;
    const waveRows = isMobile ? 22 : 34;
    const waveCount = waveCols * waveRows;
    const wavePositions = new Float32Array(waveCount * 3);
    const waveColors = new Float32Array(waveCount * 3);

    const waveWidth = 18;
    const waveDepth = 14;

    const baseColor1 = new THREE.Color(0x0d9488); // Teal sông nước
    const baseColor2 = new THREE.Color(0xf59e0b); // Amber di sản

    for (let i = 0; i < waveRows; i++) {
      for (let j = 0; j < waveCols; j++) {
        const index = (i * waveCols + j) * 3;
        const u = j / (waveCols - 1);
        const v = i / (waveRows - 1);

        const x = (u - 0.5) * waveWidth;
        const z = -v * waveDepth + 2;
        const y = -1.2;

        wavePositions[index] = x;
        wavePositions[index + 1] = y;
        wavePositions[index + 2] = z;

        const mixedColor = baseColor1.clone().lerp(baseColor2, Math.sin(u * Math.PI) * 0.4);
        waveColors[index] = mixedColor.r;
        waveColors[index + 1] = mixedColor.g;
        waveColors[index + 2] = mixedColor.b;
      }
    }

    const waveGeometry = new THREE.BufferGeometry();
    waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    waveGeometry.setAttribute('color', new THREE.BufferAttribute(waveColors, 3));

    const waveMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const wavePoints = new THREE.Points(waveGeometry, waveMaterial);
    scene.add(wavePoints);

    // --- 2. Tinh Hoa Di Sản / Đom Đóm Khắp Không Gian (Floating Heritage Embers) ---
    const emberCount = isMobile ? 45 : 85;
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities = [];

    for (let i = 0; i < emberCount; i++) {
      const idx = i * 3;
      emberPositions[idx] = (Math.random() - 0.5) * 16;
      emberPositions[idx + 1] = Math.random() * 6 - 1;
      emberPositions[idx + 2] = (Math.random() - 0.5) * 10;

      emberVelocities.push({
        y: 0.003 + Math.random() * 0.006,
        x: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.002,
        pulseSpeed: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }

    const emberGeometry = new THREE.BufferGeometry();
    emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMaterial = new THREE.PointsMaterial({
      size: 0.28,
      map: particleTexture,
      color: 0xfef08a,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const emberPoints = new THREE.Points(emberGeometry, emberMaterial);
    scene.add(emberPoints);

    // --- 3. Vòng Nhật Nguyệt Tinh Tế (Celestial Ring / Trống Đồng Halo) ---
    const ringRadius = 4.8;
    const ringSegments = 120;
    const ringPositions = new Float32Array(ringSegments * 3);

    for (let i = 0; i < ringSegments; i++) {
      const theta = (i / ringSegments) * Math.PI * 2;
      const idx = i * 3;
      ringPositions[idx] = Math.cos(theta) * ringRadius;
      ringPositions[idx + 1] = Math.sin(theta) * ringRadius;
      ringPositions[idx + 2] = 0;
    }

    const ringGeometry = new THREE.BufferGeometry();
    ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));

    const ringMaterial = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTexture,
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const celestialRing = new THREE.Points(ringGeometry, ringMaterial);
    celestialRing.rotation.x = Math.PI * 0.28;
    celestialRing.rotation.y = Math.PI * 0.15;
    celestialRing.position.set(0, 0.8, -4.5);
    scene.add(celestialRing);

    // --- Xử lý thị sai di chuột (Parallax) ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.6;
      targetY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // --- Quản lý hiển thị (Tự tạm dừng khi cuộn khuất màn hình) ---
    let isVisible = true;
    let animationFrameId;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    // --- Animation Loop ---
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Mượt hóa chuyển động thị sai chuột (Lerp)
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      camera.position.x = mouseX * 1.5;
      camera.position.y = 2.2 + mouseY * 0.8;
      camera.lookAt(0, 0.2, -1);

      // 1. Cập nhật dải sóng núi non
      const posAttr = waveGeometry.attributes.position;
      for (let i = 0; i < waveRows; i++) {
        for (let j = 0; j < waveCols; j++) {
          const idx = (i * waveCols + j) * 3;
          const u = j / waveCols;
          const v = i / waveRows;
          const elevation =
            Math.sin(u * 5 + elapsedTime * 0.7) * 0.35 +
            Math.cos(v * 4 + elapsedTime * 0.5) * 0.28 +
            Math.sin((u + v) * 3 + elapsedTime * 0.6) * 0.2;
          posAttr.setY(idx, -1.2 + elevation);
        }
      }
      posAttr.needsUpdate = true;

      // 2. Cập nhật đom đóm bay
      const emberPos = emberGeometry.attributes.position;
      for (let i = 0; i < emberCount; i++) {
        const idx = i * 3;
        const vel = emberVelocities[i];

        let curY = emberPos.getY(idx) + vel.y;
        let curX = emberPos.getX(idx) + vel.x + Math.sin(elapsedTime * vel.pulseSpeed + vel.phase) * 0.003;
        let curZ = emberPos.getZ(idx) + vel.z;

        if (curY > 5.5) curY = -1.5;

        emberPos.setX(idx, curX);
        emberPos.setY(idx, curY);
        emberPos.setZ(idx, curZ);
      }
      emberPos.needsUpdate = true;

      // 3. Xoay vòng Nhật Nguyệt
      celestialRing.rotation.z += 0.0012;

      try {
        renderer.render(scene, camera);
      } catch {
        cancelAnimationFrame(animationFrameId);
      }
    };

    animate();

    // --- Xử lý Resize ---
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup giải phóng tài nguyên ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      particleTexture.dispose();
      waveGeometry.dispose();
      waveMaterial.dispose();
      emberGeometry.dispose();
      emberMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    />
  );
};

export default HeritageHero3D;
