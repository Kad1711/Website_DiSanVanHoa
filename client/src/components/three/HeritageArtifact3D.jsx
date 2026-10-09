import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

/**
 * HeritageArtifact3D
 * Mô hình Cổ Thư Di Sản 3D (Interactive Ancient Heritage Tome):
 * - Cho phép người dùng kéo chuột/vuốt ngón tay để xoay 360° ngắm nhìn cuốn sách di sản.
 * - Hiệu ứng lơ lửng bồng bềnh (levitation) cùng các đốm bụi vàng tinh hoa xoay quanh.
 * - Ánh sáng ấm áp phong cách hoàng hôn/lửa trại.
 * - Nút tương tác: Tự động xoay, Đặt lại góc nhìn.
 */
const HeritageArtifact3D = ({ title = 'Khám Phá Cổ Thư Di Sản', subtitle = 'Tương tác 3D đa chiều' }) => {
  const mountRef = useRef(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const controlsRef = useRef({ reset: null });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Kiểm tra WebGL
    try {
      const testCanvas = document.createElement('canvas');
      if (!window.WebGLRenderingContext || (!testCanvas.getContext('webgl') && !testCanvas.getContext('experimental-webgl'))) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 1.2, 5.2);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch {
      setWebglSupported(false);
      return;
    }

    // --- Ánh sáng ---
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.2); // Warm ambient
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xfef08a, 4.5);
    mainSpot.position.set(3, 5, 4);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    const fillLight = new THREE.PointLight(0xd97706, 2, 8); // Bronze amber fill
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 1.2, 8); // Cool rim highlight
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // --- Group chính chứa cuốn sách ---
    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // 1. Bìa sách (Book Covers - Bìa da/gỗ cổ xưa)
    const coverMaterial = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Nâu gỗ cổ / da thuộc
      roughness: 0.45,
      metalness: 0.15,
    });

    const goldTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Vàng kim dập nổi
      roughness: 0.25,
      metalness: 0.85,
    });

    const pagesMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef3c7, // Giấy dó vàng ngà
      roughness: 0.8,
      metalness: 0.05,
    });

    // Kích thước sách
    const bWidth = 2.0;
    const bHeight = 2.7;
    const bThickness = 0.38;

    // Ruột giấy (Pages block)
    const pagesGeo = new THREE.BoxGeometry(bWidth * 0.94, bHeight * 0.94, bThickness * 0.88);
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMaterial);
    pagesMesh.position.set(0.04, 0, 0);
    pagesMesh.castShadow = true;
    bookGroup.add(pagesMesh);

    // Bìa trước (Front Cover)
    const frontCoverGeo = new THREE.BoxGeometry(bWidth, bHeight, 0.05);
    const frontCover = new THREE.Mesh(frontCoverGeo, coverMaterial);
    frontCover.position.set(0, 0, bThickness * 0.46);
    frontCover.castShadow = true;
    bookGroup.add(frontCover);

    // Bìa sau (Back Cover)
    const backCoverGeo = new THREE.BoxGeometry(bWidth, bHeight, 0.05);
    const backCover = new THREE.Mesh(backCoverGeo, coverMaterial);
    backCover.position.set(0, 0, -bThickness * 0.46);
    backCover.castShadow = true;
    bookGroup.add(backCover);

    // Gáy sách (Spine)
    const spineGeo = new THREE.CylinderGeometry(bThickness * 0.5, bThickness * 0.5, bHeight, 16, 1, false, Math.PI * 0.5, Math.PI);
    const spineMesh = new THREE.Mesh(spineGeo, coverMaterial);
    spineMesh.position.set(-bWidth * 0.49, 0, 0);
    spineMesh.rotation.y = Math.PI * 0.5;
    bookGroup.add(spineMesh);

    // Họa tiết hoa văn kim loại dập nổi trên bìa (Gold Emblem on Front)
    const emblemRingGeo = new THREE.TorusGeometry(0.5, 0.035, 12, 32);
    const emblemRing = new THREE.Mesh(emblemRingGeo, goldTrimMaterial);
    emblemRing.position.set(0.08, 0, bThickness * 0.49 + 0.01);
    bookGroup.add(emblemRing);

    const emblemCenterGeo = new THREE.OctahedronGeometry(0.22);
    const emblemCenter = new THREE.Mesh(emblemCenterGeo, goldTrimMaterial);
    emblemCenter.position.set(0.08, 0, bThickness * 0.49 + 0.02);
    emblemCenter.rotation.z = Math.PI * 0.25;
    bookGroup.add(emblemCenter);

    // Nẹp góc sách dát vàng (Corner Protectors)
    const cornerGeo = new THREE.BoxGeometry(0.25, 0.25, 0.08);
    const c1 = new THREE.Mesh(cornerGeo, goldTrimMaterial);
    c1.position.set(bWidth * 0.44, bHeight * 0.44, bThickness * 0.46);
    const c2 = new THREE.Mesh(cornerGeo, goldTrimMaterial);
    c2.position.set(bWidth * 0.44, -bHeight * 0.44, bThickness * 0.46);
    bookGroup.add(c1, c2);

    // --- Bụi sao / Tinh vân xoay quanh cuốn sách (Orbiting Dust Particles) ---
    const pCount = 60;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const angle = (i / pCount) * Math.PI * 2;
      const r = 2.0 + Math.random() * 1.2;
      pPos[i * 3] = Math.cos(angle) * r;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      pPos[i * 3 + 2] = Math.sin(angle) * r;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, '#ffffff');
    pGrad.addColorStop(0.3, '#f59e0b');
    pGrad.addColorStop(1, 'transparent');
    pCtx.fillStyle = pGrad;
    pCtx.arc(16, 16, 16, 0, Math.PI * 2);
    pCtx.fill();
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.14,
      map: pTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(pGeo, pMat);
    scene.add(particleSystem);

    // Đặt góc nhìn ban đầu hấp dẫn
    bookGroup.rotation.set(0.3, -0.65, 0.1);

    // --- Xử lý xoay bằng chuột/tay (Drag Controls) ---
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = -0.65;
    let targetRotationX = 0.3;

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      targetRotationY += deltaX * 0.009;
      targetRotationX += deltaY * 0.009;

      // Giới hạn góc nghiêng dọc tránh bị lật ngược quá mức
      targetRotationX = Math.max(-1.1, Math.min(1.1, targetRotationX));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    controlsRef.current.reset = () => {
      targetRotationX = 0.3;
      targetRotationY = -0.65;
    };

    // --- Loop ---
    let clock = new THREE.Clock();
    let frameId;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Hiệu ứng bồng bềnh lơ lửng nhẹ nhàng
      bookGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;

      // Tự động xoay chậm nếu bật chế độ và không đang rê chuột kéo
      if (isAutoRotate && !isDragging) {
        targetRotationY += delta * 0.35;
      }

      // Nội suy xoay mượt mà (Damping)
      bookGroup.rotation.y += (targetRotationY - bookGroup.rotation.y) * 0.08;
      bookGroup.rotation.x += (targetRotationX - bookGroup.rotation.x) * 0.08;

      // Bụi vàng xoay quanh
      particleSystem.rotation.y = elapsed * 0.15;
      particleSystem.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

      try {
        renderer.render(scene, camera);
      } catch {
        cancelAnimationFrame(frameId);
      }
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      if (domElement) {
        domElement.removeEventListener('mousedown', onPointerDown);
        domElement.removeEventListener('touchstart', onPointerDown);
      }
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      if (container && domElement && container.contains(domElement)) {
        container.removeChild(domElement);
      }

      // Dispose
      pagesGeo.dispose();
      pagesMaterial.dispose();
      frontCoverGeo.dispose();
      backCoverGeo.dispose();
      coverMaterial.dispose();
      spineGeo.dispose();
      emblemRingGeo.dispose();
      emblemCenterGeo.dispose();
      goldTrimMaterial.dispose();
      cornerGeo.dispose();
      pGeo.dispose();
      pMat.dispose();
      pTexture.dispose();
      renderer.dispose();
    };
  }, [isAutoRotate]);

  return (
    <div 
      className="relative w-full h-[360px] sm:h-[440px] rounded-3xl bg-gradient-to-b from-gray-950 via-primary-950 to-gray-900 overflow-hidden border border-amber-500/20 shadow-2xl group flex flex-col justify-between p-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Canvas Container hoặc 2D Fallback */}
      {webglSupported ? (
        <div 
          ref={mountRef} 
          className="absolute inset-0 cursor-grab active:cursor-grabbing z-0"
          title="Kéo chuột để xoay 360°"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0 bg-gradient-to-b from-gray-900 via-primary-950 to-gray-950 pointer-events-none">
          <div className="w-20 h-24 rounded-xl border-2 border-amber-500/50 bg-amber-950/40 shadow-inner flex flex-col items-center justify-center mb-3">
            <span className="font-serif text-3xl text-amber-300">📖</span>
            <span className="text-[10px] text-amber-200/80 font-bold uppercase tracking-wider mt-1">Cổ Thư</span>
          </div>
          <p className="text-xs text-amber-200/70 max-w-xs">Chế độ hiển thị 2D tương thích cho thiết bị</p>
        </div>
      )}

      {/* Header Info */}
      <div className="relative z-10 pointer-events-none flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold backdrop-blur-md mb-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Mô Hình Di Sản 3D</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white drop-shadow-md">
            {title}
          </h3>
          <p className="text-xs text-amber-200/70">{subtitle}</p>
        </div>

        <div className="text-right text-[11px] text-gray-400 backdrop-blur-sm bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">
          <span>Kéo chuột để xoay 360°</span>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto pt-3 border-t border-white/10">
        <span className="text-[11px] text-gray-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Không gian ba chiều WebGL</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => controlsRef.current.reset?.()}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition text-xs flex items-center gap-1 border border-white/10"
            title="Đặt lại góc nhìn"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Góc chuẩn</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              isAutoRotate 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20'
            }`}
          >
            {isAutoRotate ? 'Đang tự xoay' : 'Dừng xoay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeritageArtifact3D;
