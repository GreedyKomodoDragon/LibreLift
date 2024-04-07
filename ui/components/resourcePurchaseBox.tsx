import { MouseEventHandler } from "react";

/* eslint-disable @next/next/no-img-element */
type ResourcePurchaseBoxProps = {
  title: string;
  pricing: string;
  url: string;
  hasSubscription: boolean;
  oneTimePayment: MouseEventHandler<HTMLButtonElement>;
  subscribe: MouseEventHandler<HTMLButtonElement>;
};

export default function ResourcePurchaseBox(props: ResourcePurchaseBoxProps) {
  return (
    <div className="w-full p-4 zoom transition-transform duration-200 transform hover:scale-[1.01]">
      <div className="bg-white rounded-lg shadow-md py-6 px-4 min-h-60">
        <div className="flex justify-center items-center">
          <img src={props.url} alt="icon" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
        <p className="text-gray-600 mb-2">{props.pricing}</p>
        <div className="flex justify-center items-center">
          <button
            className="inline-flex min-h-[3rem] items-center bg-gray-900 hover:bg-gray-700 text-white py-2 px-4 rounded-lg mr-1"
            onClick={props.oneTimePayment}
          >
            One-Time Payment
          </button>
          {props.hasSubscription && (
            <button className="min-h-[3rem] text-lg items-center bg-blue-800 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
              Manage Subscription
            </button>
          )}
          {!props.hasSubscription && (
            <button className="min-h-[3rem] text-lg items-center bg-green-800 hover:bg-green-700 text-white py-2 px-4 rounded-lg">
              Subscribe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
