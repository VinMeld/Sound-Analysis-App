"use client";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useDrag } from "react-use-gesture";
import { useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Line, OrbitControls } from "@react-three/drei";

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

type CubeProps = {
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

const Cube = ({ onMove, position }: CubeProps) => {
  const ref = useRef<THREE.Mesh | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { gl, camera } = useThree();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01; // Rotate cube around the x-axis
      ref.current.rotation.y += 0.01; // Rotate cube around the y-axis
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(true);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging) return;

    event.stopPropagation();

    const x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    const y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5).unproject(camera);
    ref.current?.position.set(vector.x, vector.y, vector.z);
    onMove({ x: vector.x, y: vector.y, z: vector.z });
  };

  const stopDragging = (event: PointerEvent) => {
    setIsDragging(false);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
  };

  return (
    <mesh ref={ref} onPointerDown={handlePointerDown} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

function Sphere({ position }: SphereProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}

function ConnectionLine({ start, end }: ConnectionLineProps) {
  return (
    <Line
      points={[new THREE.Vector3(start[0], start[1], start[2]), end]}
      color="black"
    />
  );
}
function InnerScene() {
    const { camera: rawCamera, size } = useThree();
    const camera = rawCamera as THREE.PerspectiveCamera;
    
    const [cubePos, setCubePos] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
    }, [camera, size]);

    const handleCubeMove = (position: Vector3) => {
        setCubePos(new THREE.Vector3(position.x, position.y, position.z));
    };

    return (
        <>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Cube position={cubePos} onMove={handleCubeMove} />
        <Sphere position={[-2, 2, 0]} />
        <Sphere position={[2, 2, 0]} />
        <Sphere position={[-2, -2, 0]} />
        <ConnectionLine start={[-2, 2, 0]} end={cubePos} />
        <ConnectionLine start={[2, 2, 0]} end={cubePos} />
        <ConnectionLine start={[-2, -2, 0]} end={cubePos} />
        <OrbitControls />
        </>
    );
}

export default function Scene() {
//   const [cubePos, setCubePos] = useState<THREE.Vector3>(
//     new THREE.Vector3(0, 0, 0)
//   );
//   const { camera: rawCamera, size } = useThree();
//   const camera = rawCamera as THREE.PerspectiveCamera;
  
//   useEffect(() => {
//       camera.aspect = size.width / size.height;
//       camera.updateProjectionMatrix();
//   }, [camera, size]);

//     const handleCubeMove = (position: Vector3) => {
//     setCubePos(new THREE.Vector3(position.x, position.y, position.z));
//   };

  return (
    <div className="h-screen w-screen overflow-hidden m-0 p-0">
      <Canvas
        camera={{ position: [0, 0, 5] }}
        className="bg-white w-full h-full"
      >
        <InnerScene />
      </Canvas>
    </div>
  );
}
