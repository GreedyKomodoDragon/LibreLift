import React, { useEffect, useState } from "react";

interface ToastProps {
  message: React.ReactNode; // Accepts JSX for dynamic content
  onClose: () => void;
  position?:
    | "top-left"
    | "top-middle"
    | "top-right"
    | "bottom-left"
    | "bottom-middle"
    | "bottom-right";
  duration?: number;
  onCloseClick?: () => void;
  persistent?: boolean; // Allows making the Toast persistent
  color?: "blue" | "green" | "red"; // Added color prop
}

const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  position = "bottom-right",
  duration = 5000,
  persistent = false,
  color = "red", // Default color is red
}) => {
  const [visible, setVisible] = useState(true);
  let timer: NodeJS.Timeout;

  useEffect(() => {
    if (!persistent) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [duration, persistent]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // Ensure closing animation completes before invoking onClose
  };

  const handleMouseEnter = () => {
    if (!persistent) {
      clearTimeout(timer);
    }
  };

  const handleMouseLeave = () => {
    if (!persistent) {
      timer = setTimeout(() => {
        handleClose();
      }, 1000); // Resume after 1 second delay
    }
  };

  const getPositionStyles = (): string => {
    switch (position) {
      case "top-left":
        return "top-10 left-10";
      case "top-middle":
        return "top-10 left-1/2 transform -translate-x-1/2";
      case "top-right":
        return "top-10 right-10";
      case "bottom-left":
        return "bottom-10 left-10";
      case "bottom-middle":
        return "bottom-10 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
      default:
        return "bottom-10 right-10";
    }
  };

  const getColorStyles = (): string => {
    switch (color) {
      case "blue":
        return "bg-blue-800";
      case "green":
        return "bg-green-800";
      case "red":
      default:
        return "bg-red-800";
    }
  };

  return (
    <div
      className={`fixed ${getColorStyles()} text-white p-4 rounded-md shadow-lg z-50 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${getPositionStyles()} ${position === 'top-middle' && "mt-6"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex justify-between items-center">
        <div>{message}</div>
      </div>
    </div>
  );
};

export default Toast;
