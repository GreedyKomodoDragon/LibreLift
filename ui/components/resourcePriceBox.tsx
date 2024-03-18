type ResourcePriceBoxProps = {
  title: string;
  pricing: string;
};

export default function ResourcePriceBox(props: ResourcePriceBoxProps) {
  return (
    <div className="w-full p-4 zoom transition-transform duration-200 transform hover:scale-[1.01]">
      <div className="bg-white rounded-lg shadow-md p-6">
        <svg
          className="w-12 h-12 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
        <p className="text-gray-600">{props.pricing}</p>
      </div>
    </div>
  );
}
