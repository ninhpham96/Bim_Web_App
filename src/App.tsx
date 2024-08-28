import { useEffect, useRef } from "react";
import { BasicComponent } from "./BimModel/OpenBIMComponents/src/BasicComponent";

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const bim = new BasicComponent(containerRef.current!);
    return () => {
      bim?.dispose();
    };
  }, [])
  return (
    <>
      <div className="relative w-full h-full" ref={containerRef}>
      </div>
    </>
  );
}

export default App
