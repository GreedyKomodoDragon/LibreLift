/* eslint-disable @next/next/no-img-element */

type SearchRowProps = {
  projectName: string;
  description: string;
  id: number;
}

export default function SearchRow(props: SearchRowProps) {
  return (
    <div className="w-full mb-4 zoom transition-transform duration-200 transform hover:scale-[1.005]">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-2">{props.projectName}</h3>
        <p className="text-gray-600 mb-4">{props.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Stars: 1000</p>
            <p className="text-sm text-gray-500">Last Update: 1000</p>
          </div>
          <div>
            <a
              href={`https://www.github.com/${props.projectName}`}
              className="inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-1"
              target="_blank" rel="noopener noreferrer"
            >
              <img
                src={"/github-mark.svg"}
                style={{ height: 40, width: 40 }}
                alt="Github logo"
                className="mr-2"
              />
              View on Github
            </a>
            <a
              href={`/repositories/${props.id}`}
              className="inline-flex items-center bg-blue-900 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              <img
                src={"/logo.svg"}
                style={{ height: 40, width: 40 }}
                alt="Github logo"
                className="mr-2"
              />
              View on LibreLift
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
