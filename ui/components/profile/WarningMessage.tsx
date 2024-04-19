import React from "react";
import LoadingButton from "../loadingButton";

interface WarningMessageProps {
  message: string;
  onDismissClick: () => void;
  onCreateAccountClick: () => Promise<void>;
}

const WarningMessage: React.FC<WarningMessageProps> = ({
  message,
  onDismissClick,
  onCreateAccountClick,
}) => {
  return (
    <div
      className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 flex justify-between items-center"
      role="alert"
    >
      <div className="flex items-center">
        <div className="py-1">
          <svg
            className="fill-current h-6 w-6 text-yellow-500 mr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 6a1 1 0 112 0v4a1 1 0 11-2 0V6zm1 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p className="font-bold">Warning</p>
          <p>{message}</p>
        </div>
      </div>
      <div className="flex">
        <LoadingButton
          buttonColor={"blue"}
          message={"Create Account"}
          onClick={onCreateAccountClick}
        />
        <button
          onClick={onDismissClick}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded ml-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default WarningMessage;
