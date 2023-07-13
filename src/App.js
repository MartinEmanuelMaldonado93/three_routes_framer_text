import { Canvas, useFrame, extend } from '@react-three/fiber';
import {
  useGLTF,
  Float,
  Lightformer,
  Text,
  Html,
  ContactShadows,
  Environment,
  MeshTransmissionMaterial,
} from '@react-three/drei';
import { EffectComposer, N8AO, TiltShift2 } from '@react-three/postprocessing';
import { Route, Link, useLocation } from 'wouter';
import { suspend } from 'suspend-react';
import { easing } from 'maath';
import { Suspense } from 'react';
// import { AnimatePresence } from 'framer-motion';
import { motion as m, AnimatePresence } from 'framer-motion-3d';

const inter = import('@pmndrs/assets/fonts/inter_regular.woff');
useGLTF.preload('/bomb-gp.glb');

export const App = () => (
  <>
    <Canvas
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      shadows
      camera={{ position: [0, 0, 20], fov: 50 }}>
      <color attach="background" args={['#e0e0e0']} />
      <spotLight position={[20, 20, 10]} penumbra={1} castShadow angle={0.2} />
      <Status position={[0, 0, -10]} />
      <Float floatIntensity={2}>
        <Route path="/">
          <Torus key={Math.random().toString()} />
        </Route>
        <Route path="/knot">
          <Knot key={Math.random().toString()} />
        </Route>
        <Route path="/bomb">
          <Bomb scale={0.7} key={Math.random().toString()} />
        </Route>
      </Float>
      <ContactShadows scale={100} position={[0, -7.5, 0]} blur={1} far={100} opacity={0.85} />
      <Environment preset="city">
        <Lightformer intensity={8} position={[10, 5, 0]} scale={[10, 50, 1]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
      </Environment>
      <EffectComposer disableNormalPass>
        <N8AO aoRadius={1} intensity={2} />
        <TiltShift2 blur={0.2} />
      </EffectComposer>
      <Rig />
    </Canvas>
    <div class="nav">
      <Link to="/">torus</Link>
      <Link to="/knot">knot</Link>
      <Link to="/bomb">bomb</Link>
    </div>
  </>
);

function AnimateMesh({ children, geometry }, props) {
  return (
    <m.mesh
      geometry={geometry ?? undefined}
      receiveShadow
      castShadow
      {...props}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        damping: 13,
        stiffness: 90,
        delay: 0.8,
      }}>
      {children}
    </m.mesh>
  );
}

function Rig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [Math.sin(-state.pointer.x) * 5, state.pointer.y * 3.5, 15 + Math.cos(state.pointer.x) * 10],
      0.2,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });
}

function Torus(props) {
  return (
    <AnimateMesh {...props}>
      <torusGeometry args={[4, 1.2, 128, 64]} />
      <MeshTransmissionMaterial backside backsideThickness={5} thickness={2} />
    </AnimateMesh>
  );
}

function Knot(props) {
  return (
    <AnimateMesh {...props}>
      <torusKnotGeometry args={[3, 1, 256, 32]} />
      <MeshTransmissionMaterial backside backsideThickness={5} thickness={2} />
    </AnimateMesh>
  );
}

function Bomb(props) {
  const { nodes } = useGLTF('/bomb-gp.glb');
  return (
    <AnimateMesh geometry={nodes.Little_Boy_Little_Boy_Material_0.geometry} {...props}>
      <MeshTransmissionMaterial backside backsideThickness={10} thickness={5} />
    </AnimateMesh>
  );
}

function Status(props) {
  const [loc] = useLocation();
  const text = loc === '/' ? '/torus' : loc;
  return (
    <Text fontSize={14} letterSpacing={-0.025} font={suspend(inter).default} color="black" {...props}>
      {text}
      <Html style={{ color: 'transparent', fontSize: '33.5em' }} transform>
        {text}
      </Html>
    </Text>
  );
}
