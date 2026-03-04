// SignatureCanvas.js
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./SignatureCanvas.css";

const SignatureCanvasComponent = forwardRef(({ onSignatureChange }, ref) => {
  const sigCanvas = useRef(null);

  // ✅ Update signature when stroke ends
  const handleEnd = () => {
    if (sigCanvas.current) {
      const signature = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      onSignatureChange(signature);
    }
  };

  // ✅ Clear signature
  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onSignatureChange("");
    }
  };

  // ✅ Expose clearSignature method to parent via ref
  useImperativeHandle(ref, () => ({
    clearSignature: clear,
  }));

  // ✅ Fix scaling / pointer offset
  useEffect(() => {
    const canvas = sigCanvas.current.getCanvas();

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      // Save signature before resizing
      const data = sigCanvas.current.toData();

      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);

      // Restore previous signature if any
      sigCanvas.current.fromData(data);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="sigCanvasContainer">
      <SignatureCanvas
        ref={sigCanvas}
        
        penColor="blue"
        canvasProps={{ className: "sigCanvas" }}
        onEnd={handleEnd}
      />
      <button
        type="button"
        onClick={clear}
        className="btn btn-danger btn-sm fit-btn ms-auto"
      >
        Clear
      </button>
    </div>
  );
});

export default SignatureCanvasComponent;
