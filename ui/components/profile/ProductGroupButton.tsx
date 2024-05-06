"use client";

import { useEffect, useState } from "react";

type ProductGroupButtonProps = {
  onChange: (value: string) => void;
  className: string;
};

export default function ProductGroupButton(props: ProductGroupButtonProps) {
  const [option, setOption] = useState<string>("selected");

  useEffect(() => {
    props.onChange(option);
  }, [option]);

  return (
    <div className={"flex " + props.className}>
      <button
        className={`${
          option === "selected" ? "bg-violet-800" : "bg-violet-500"
        } hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-l focus:outline-none focus:shadow-outline`}
        onClick={() => setOption("selected")}
      >
        Selected
      </button>
      <button
        className={`${
          option === "unselected" ? "bg-violet-800" : "bg-violet-500"
        } hover:bg-violet-600 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline rounded-r`}
        onClick={() => setOption("unselected")}
      >
        Unselected
      </button>
    </div>
  );
}
