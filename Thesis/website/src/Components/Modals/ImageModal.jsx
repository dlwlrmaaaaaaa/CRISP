import React, { useState, useRef } from "react";

const ImageModal = ({ isVisible, onClose, attachment }) => {
  const [scale, setScale] = useState(1); // Scale of the image (zoom level)
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Position for panning
  const imageRef = useRef(null); // Reference to the image element

  if (!isVisible) return null;

  // Handle zoom using mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();

    const zoomIntensity = 0.1;
    let newScale = scale + (e.deltaY > 0 ? -zoomIntensity : zoomIntensity);
    newScale = Math.min(Math.max(newScale, 1), 3); // Set zoom limits (1x to 3x)

    setScale(newScale);
  };

  // Handle dragging to pan image
  const handleMouseDown = (e) => {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="fixed inset-0 w-full h-screen bg-black/75 flex items-center justify-center z-40"
      onClick={(e) => {
        if (e.target.id === "container") {
          onClose();
        }
      }}
    >
      <div
        className="relative flex items-center justify-center rounded-lg w-screen h-screen"
        id="container"
      >
        <img
          ref={imageRef}
          src={attachment}
          alt={`Image ${attachment}`}
          className="w-auto h-auto md:h-[90vh] max-w-full max-h-full rounded-lg"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transition: "transform 0.25s ease", // Smooth transition for scaling and panning
          }}
          onWheel={handleWheel} // Handle zoom with mouse wheel
          onMouseDown={handleMouseDown} // Handle panning with mouse drag
        />
        <button
          className="absolute text-white top-7 right-5 text-5xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
