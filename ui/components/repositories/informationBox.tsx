import React from 'react';

interface InformationBoxProps {
  message: string;
}

const InformationBox: React.FC<InformationBoxProps> = ({ message }) => {
  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 rounded px-4 py-3 shadow-md flex items-center">
      <div className="text-blue-500 mr-4">
        <svg
          className="fill-current h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M10 0C4.477 0 0 4.477 0 10c0 5.522 4.477 10 10 10 5.522 0 10-4.478 10-10 0-5.523-4.478-10-10-10zm0 18.75c-4.922 0-8.75-3.829-8.75-8.75S5.078 1.25 10 1.25c4.921 0 8.75 3.828 8.75 8.75S14.921 18.75 10 18.75zM9 5h2v2H9zm0 4h2v6H9z" />
        </svg>
      </div>
      <div className="text-lg">
        <p className="text-blue-700">{message}</p>
      </div>
    </div>
  );
};

export default InformationBox;
