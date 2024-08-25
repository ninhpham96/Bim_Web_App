import { useEffect, useRef } from "react";
import { ThreeJS } from "@/BimModel/ThreeJS/src/ThreeJS";
import { Geometries } from "./BimModel/ThreeJS/src/Geometries";
import { Road } from "./BimModel/ThreeJS/Road/Road";

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const threeJS = new ThreeJS(containerRef.current!, canvasRef.current!);
    const geometries = new Geometries(threeJS.scene);
    const road = new Road(threeJS.scene);
    return () => {
      threeJS?.dispose();
      geometries?.dispose();
      road?.dispose();
    };
  }, [])
  return (
    <>
      <div className="relative w-full h-full" ref={containerRef}>
        <canvas className="absolute w-full h-full" ref={canvasRef} />
      </div>
    </>
  );
}

export default App
