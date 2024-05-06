"use client";

import { MouseEventHandler } from "react";
import LoadingButton from "./loadingButton";

/* eslint-disable @next/next/no-img-element */
type ResourcePriceBoxProps = {
  title: string;
  pricing: string;
  url: string;
  option?: boolean;
  added?: boolean;
  onAddClick?: () => Promise<void>;
  onRemoveClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

export default function ResourcePriceBox(props: ResourcePriceBoxProps) {
  return (
    <div className="w-full p-4 zoom transition-transform duration-200 transform hover:scale-[1.01]">
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-center">
        <div className="flex justify-center items-center mr-0 sm:mr-6 mb-4 sm:mb-0">
          <img src={props.url} alt="icon" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
          <p className="text-gray-600 relative">
            {props.pricing}{" "}
            {props.option && (
              <>
                {props.added ? (
                  <button
                    className="inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mb-2 sm:mb-0"
                    onClick={props.onRemoveClick}
                    disabled={props.disabled !== undefined && props.disabled}
                  >
                    Remove Option
                  </button>
                ) : (
                  <div className="mt-4">
                    <LoadingButton
                      buttonColor={"gray"}
                      message={"Add as Option"}
                      onClick={props.onAddClick}
                      disabled={props.disabled}
                    />
                  </div>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
