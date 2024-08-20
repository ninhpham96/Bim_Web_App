import { useEffect, useRef } from "react";
import { ThreeJS } from "@/BimModel/ThreeJS/src/ThreeJS";

function App() {
  const container = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const threeJS = new ThreeJS(container.current!);
    return () => {
      threeJS?.dispose();
    };
  }, [])
  return (
    <>
      <div className="h-full" ref={container}>Hello!!!</div>
    </>
  );
}

export default App
