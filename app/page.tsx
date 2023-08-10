"use client"
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDrag } from 'react-use-gesture';
import { useThree } from "@react-three/fiber";
import * as THREE from 'three';

function Square({ onMove, position }) {
  const ref = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const { gl, camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.z += 0.01; // Rotate square around the z-axis
    }
  });


  const handlePointerDown = (event) => {
    setIsDragging(true);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    event.stopPropagation();

    // Translate the event clientX and clientY into normalized device coordinates
    const x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    const y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

    // Convert the normalized device coordinates into a 3D position
    const vector = new THREE.Vector3(x, y, 0).unproject(camera);

    ref.current.position.set(vector.x, vector.y, 0);
    onMove({ x: vector.x, y: vector.y, z: 0 });

  };
  
  const stopDragging = (event) => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopDragging);
  };

  const handlePointerUp = (event) => {
    setIsDragging(false);
  };

  return (
    <mesh
    ref={ref}
    onPointerDown={handlePointerDown}
    position={position}
  >
    <planeGeometry args={[1, 1]} />
    <meshStandardMaterial color="blue" />
  </mesh>
  );

}

function Sphere({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}

function ConnectionLine({ start, end }) {
  const lineRef = useRef();

  useEffect(() => {
    if (lineRef.current) {
      const startVec = new THREE.Vector3(...start);
      const endVec = new THREE.Vector3(...end);
      lineRef.current.geometry.setFromPoints([startVec, endVec]);
      lineRef.current.geometry.verticesNeedUpdate = true;
    }
  }, [start, end]);

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" />
      <lineBasicMaterial attach="material" color="black" />
    </line>
  );
}

export default function Scene() {
  const [squarePos, setSquarePos] = useState(new THREE.Vector3(0, 0, 0)); // Use state

  const handleSquareMove = (position) => {
    setSquarePos(new THREE.Vector3(position.x, position.y, position.z));
  };

  return (
    <Canvas camera={{ position: [0, 0, 5] }} className="bg-white w-screen h-screen">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Square position={squarePos} onMove={handleSquareMove} />
      <Sphere position={[-2, 2, 0]} />
      <Sphere position={[2, 2, 0]} />
      <Sphere position={[-2, -2, 0]} />
      <ConnectionLine start={[-2, 2, 0]} end={squarePos} />
      <ConnectionLine start={[2, 2, 0]} end={squarePos} />
      <ConnectionLine start={[-2, -2, 0]} end={squarePos} />
    </Canvas>
  );
}
