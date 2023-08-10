"use client"
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useDrag } from 'react-use-gesture';
import { useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from 'three';
import { Line } from "@react-three/drei";

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

type SquareProps = {
  onMove: (position: Vector3) => void;
  position: THREE.Vector3;
};
type SphereProps = {
  position: [number, number, number];
};
type ConnectionLineProps = {
  start: [number, number, number];
  end: THREE.Vector3;
};
const Square = ({ onMove, position } : SquareProps) => {
  const ref = useRef<THREE.Mesh | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { gl, camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.z += 0.01; // Rotate square around the z-axis
    }
  });


  const handlePointerDown  = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(true);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging) return;

    event.stopPropagation();

    // Translate the event clientX and clientY into normalized device coordinates
    const x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    const y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

    // Convert the normalized device coordinates into a 3D position
    const vector = new THREE.Vector3(x, y, 0).unproject(camera);
    ref.current?.position.set(vector.x, vector.y, 0);
    onMove({ x: vector.x, y: vector.y, z: 0 });

  };
  
  const stopDragging = (event: PointerEvent) => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', stopDragging);
  };

  const handlePointerUp = (event: PointerEvent) => {
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

function Sphere({ position }: SphereProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}

function ConnectionLine({ start, end } : ConnectionLineProps) {
  return (
    <Line
      points={[new THREE.Vector3(start[0], start[1], start[2]), end]}
      color="black"
    />
  );
}

  return (
    <Line
    points={[new THREE.Vector3(start[0], start[1], start[2]), end]}
    color="black"
  />
      
  );
}

export default function Scene() {
  const [squarePos, setSquarePos] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  const handleSquareMove = (position: Vector3) => {
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
