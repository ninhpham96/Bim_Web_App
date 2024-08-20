import { useEffect, useRef } from "react";
import { ThreeJS } from "@/BimModel/ThreeJS/src/ThreeJS";

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const threeJS = new ThreeJS(containerRef.current!, canvasRef.current!);
    return () => {
      threeJS?.dispose();
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
