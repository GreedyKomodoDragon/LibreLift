"use client";

import { useEffect, useState } from "react";

type ProductGroupButtonProps = {
  onChange: (value: string) => void;
};

export default function ProductGroupButton(props: ProductGroupButtonProps) {
  const [option, setOption] = useState<string>("selected");

  useEffect(() => {
    props.onChange(option);
  }, [option]);

  return (
    <div className="flex">
      <button
        className={`${
          option === "selected" ? "bg-gray-800" : "bg-gray-500"
        } hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l focus:outline-none focus:shadow-outline`}
        onClick={() => setOption("selected")}
      >
        Selected
      </button>
      <button
        className={`${
          option === "unselected" ? "bg-gray-800" : "bg-gray-500"
        } hover:bg-gray-600 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline`}
        onClick={() => setOption("unselected")}
      >
        Unselected
      </button>
      <button
        className={`${
          option === "all" ? "bg-gray-800" : "bg-gray-500"
        } hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline`}
        onClick={() => setOption("all")}
      >
        All
      </button>
    </div>
  );
}
