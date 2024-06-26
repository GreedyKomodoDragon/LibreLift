import React, { useState } from "react";
import { Oval } from "react-loader-spinner";

interface LoadingButtonProps {
  buttonColor: string;
  message: string;
  onClick?: () => Promise<void>;
  image?: React.ReactNode;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  buttonColor,
  message,
  onClick,
  image,
  disabled
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setLoading(true);
    if (onClick) {
      try {
        await onClick();
      } catch (error) {
        console.error("Error:", error);
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        className={`flex items-center bg-${buttonColor}-800 hover:bg-${buttonColor}-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-700`}
        disabled={loading || (disabled !== undefined && disabled)}
      >
        {image && <div className="mr-2">{image}</div>}
        <span>{loading ? "Loading..." : message}</span>

        {loading && (
          <div className="ml-2">
            <Oval
              visible={true}
              height="20"
              width="20"
              strokeWidth="5"
              color="white"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        )}
      </button>
    </div>
  );
};

export default LoadingButton;
