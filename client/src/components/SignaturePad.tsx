import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { RotateCcw } from "lucide-react";

export interface SignaturePadHandle {
  getSignatureFile: () => Promise<File | null>;
  clear: () => void;
}

interface Props {
  width?: number;
  height?: number;
}

/**
 * SignaturePad — a plain canvas-based drawing pad, no external library.
 * Supports both mouse and touch via pointer events. Call `getSignatureFile()`
 * on the exposed ref to get a PNG File ready for upload (e.g. in FormData).
 */
const SignaturePad = forwardRef<SignaturePadHandle, Props>(
  ({ width = 400, height = 160 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#1f2937";
    }, []);

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      const ctx = canvas.getContext("2d")!;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      drawing.current = true;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (isEmpty) setIsEmpty(false);
    };

    const handlePointerUp = () => {
      drawing.current = false;
    };

    const clear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    };

    const getSignatureFile = (): Promise<File | null> => {
      return new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return resolve(null);
        canvas.toBlob((blob) => {
          if (!blob) return resolve(null);
          resolve(new File([blob], "signature.png", { type: "image/png" }));
        }, "image/png");
      });
    };

    useImperativeHandle(ref, () => ({ getSignatureFile, clear }));

    return (
      <div>
        <div className="relative rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full touch-none cursor-crosshair"
            style={{ height }}
          />
          {isEmpty && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-300 dark:text-gray-600 pointer-events-none">
              Sign here
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={clear}
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <RotateCcw className="w-3 h-3" /> Clear
        </button>
      </div>
    );
  },
);

SignaturePad.displayName = "SignaturePad";
export default SignaturePad;
