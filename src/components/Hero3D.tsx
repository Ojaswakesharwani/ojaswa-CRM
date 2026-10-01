// =============================================================
// Three.js Hero 3D Command Core
// =============================================================
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DProps {
  className?: string;
}

export function Hero3D({ className }: Hero3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth || 280;
    const H = mount.clientHeight || 280;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- Outer glass sphere ----
    const sphereGeo = new THREE.SphereGeometry(1.8, 48, 48);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.06,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // Glass sphere wireframe
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wire = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), wireMat);
    scene.add(wire);

    // ---- Progress rings ----
    function createRing(radius: number, color: number, opacity: number) {
      const geo = new THREE.TorusGeometry(radius, 0.012, 8, 64);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      return new THREE.Mesh(geo, mat);
    }
    const ring1 = createRing(1.2, 0x10b981, 0.6);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = createRing(1.5, 0x6366f1, 0.3);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 5;
    scene.add(ring2);

    const ring3 = createRing(1.0, 0xffffff, 0.15);
    ring3.rotation.z = Math.PI / 4;
    scene.add(ring3);

    // ---- Lead nodes ----
    const nodeGroup = new THREE.Group();
    const nodePositions = [
      [0.8, 0.5, 0.4],
      [-0.7, 0.9, -0.2],
      [0.3, -0.8, 0.7],
      [-0.9, -0.4, 0.5],
      [0.6, 0.2, -0.9],
      [-0.4, 0.6, 0.8],
      [0.9, -0.6, -0.3],
    ];
    const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    nodePositions.forEach(([x, y, z]) => {
      const mat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const node = new THREE.Mesh(nodeGeo, mat);
      node.position.set(x, y, z);
      nodeGroup.add(node);
    });
    scene.add(nodeGroup);

    // ---- Connection lines between nodes ----
    const lineGroup = new THREE.Group();
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const [x1, y1, z1] = nodePositions[i];
      const [x2, y2, z2] = nodePositions[i + 1];
      const points = [
        new THREE.Vector3(x1, y1, z1),
        new THREE.Vector3(x2, y2, z2),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.2,
      });
      lineGroup.add(new THREE.Line(geo, mat));
    }
    scene.add(lineGroup);

    // ---- Particles ----
    const particleCount = 60;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 1.6 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.02,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ---- Android silhouette (simplified - extruded trapezoid) ----
    const androidShape = new THREE.Shape();
    androidShape.moveTo(-0.15, -0.3);
    androidShape.lineTo(0.15, -0.3);
    androidShape.lineTo(0.18, 0.25);
    androidShape.lineTo(-0.18, 0.25);
    androidShape.closePath();
    const extrudeSettings = { depth: 0.04, bevelEnabled: false };
    const androidGeo = new THREE.ExtrudeGeometry(androidShape, extrudeSettings);
    const androidMat = new THREE.MeshPhongMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.5,
    });
    const android = new THREE.Mesh(androidGeo, androidMat);
    android.position.set(-0.1, -0.1, 0);
    android.rotation.x = -0.2;
    scene.add(android);

    // ---- Lighting ----
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const point = new THREE.PointLight(0x10b981, 1.5, 10);
    point.position.set(3, 3, 3);
    scene.add(point);
    const point2 = new THREE.PointLight(0x6366f1, 0.8, 10);
    point2.position.set(-3, -2, 2);
    scene.add(point2);

    // ---- Mouse tracking ----
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ---- Animation loop ----
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.005;

      // Slow rotation
      sphere.rotation.y = t * 0.3;
      wire.rotation.y = t * 0.15;
      wire.rotation.x = t * 0.1;

      ring1.rotation.z = t * 0.4;
      ring2.rotation.y = t * 0.25;
      ring3.rotation.x = t * 0.3;

      nodeGroup.rotation.y = t * 0.2;
      lineGroup.rotation.y = t * 0.2;
      particles.rotation.y = t * 0.05;
      particles.rotation.x = t * 0.03;

      android.rotation.y = Math.sin(t * 0.8) * 0.3;
      android.position.y = Math.sin(t * 1.2) * 0.05 - 0.1;

      // Mouse influence
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObs = new ResizeObserver(onResize);
    resizeObs.observe(mount);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObs.disconnect();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
