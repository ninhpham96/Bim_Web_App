import { BasicComponent } from '@/BimModel/OpenBIMComponents/src/BasicComponent';
import { useEffect, useRef } from 'react'

const Viewer = () => {
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

export default Viewer
