import Image from 'next/image'; // Importing Image component from next.js for better image optimization
import React from 'react';

type SearchRowProps = {
  projectName: string;
  description: string;
  id: number;
}

export default function SearchRow(props: SearchRowProps) {
  return (
    <div className="w-full mb-4 p-2 zoom transition-transform duration-200 transform hover:scale-[1.005]">
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{props.projectName}</h3>
          <p className="text-gray-600 mb-4">{props.description}</p>
          <div className="flex items-center justify-between flex-wrap">
            <div>
              <p className="text-sm text-gray-500">Stars: 1000</p>
              <p className="text-sm text-gray-500">Last Update: 1000</p>
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
              <a
                href={`https://www.github.com/${props.projectName}`}
                className="inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-1"
                target="_blank" rel="noopener noreferrer"
              >
                <Image
                  src="/github-mark.svg"
                  alt="Github logo"
                  width={20}
                  height={20}
                  className="mr-4"
                />
                View on Github
              </a>
              <a
                href={`/repositories/${props.id}`}
                className="inline-flex items-center bg-violet-950 hover:bg-violet-600 text-white py-2 px-4 rounded-lg ml-1"
              >
                <Image
                  src="/logo.svg"
                  alt="LibreLift logo"
                  width={20}
                  height={20}
                  className="mr-4"
                />
                View on LibreLift
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
