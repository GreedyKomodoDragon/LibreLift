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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center">
          <img src={props.url} alt="icon" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
        <p className="text-gray-600">
          {props.pricing}{" "}
          {props.option && !props.added && (
            <div className="float-right inline-flex items-center">
              <LoadingButton
                buttonColor={"gray"}
                message={"Add as Option"}
                onClick={props.onAddClick}
                disabled={props.disabled}
              />
            </div>
          )}
          {props.option && props.added && (
            <button
              className="float-right inline-flex items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-1"
              onClick={props.onRemoveClick}
              disabled={props.disabled !== undefined && props.disabled}
            >
              Remove Option
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
