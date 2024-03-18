import ResourcePriceBox from "@/components/resourcePriceBox";
import React from "react";

const PricingPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-5xl font-bold text-center mb-8">Pricing Options</h1>

      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-6 w-full">
          <h2 className="text-4xl font-semibold mb-4">Subscription</h2>
          <p className="mb-4">
            Subscribe to a project and pay a flat fee of 10% for each
            transaction, this helps us cover our costs of running LibreLift.
          </p>
          <p className="mb-4">
            Subscriptions can be applied in the following form:
          </p>
          <ul className="list-disc ml-5">
            <li>Weekly - One payment per year is taken out of the account</li>
            <li>Monthly - This is take out at date selected by the user</li>
            <li>Annually - One payment per year is taken out of the account</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg p-6 w-full">
          <h2 className="text-4xl font-semibold mb-4">One-time Donation</h2>
          <p className="mb-4">
            Funders can also donate in a one-off fashion, this can be any value
            they like!* We take a flat 10% fee from every one-off payment; this
            helps us cover our costs of running LibreLift.
          </p>
          <p className="mb-4 text-sm">
            *We do have a max cap for first time donors as a way to stop fraud
            occuring!
          </p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-6 w-full">
          <h2 className="text-4xl font-semibold mb-4">
            Showing the true cost of OS Projects
          </h2>
          <p className="mb-4">
            One of our aims at LibreLift is to try and show how much it costs OS
            Project owners to keep their projects running and their developers
            fed!
          </p>
          <p className="mb-4">
            The way we are doing this is by providing subscription options that
            would cover the cost of a perspective aspect** of the OS project.
            Below are some of the types of subscriptions we are offer!
          </p>
          <p className="mb-4 text-sm">
            **All prices are estimates and may not reflect the current price of
            the resource
          </p>
        </div>
      </div>

      {/* Grid of subscription options */}
      <div className="flex flex-wrap justify-center">
        <div className="sm:w-1/3">
          <ResourcePriceBox title="EC2 Instance" pricing="$50 per Month" />
        </div>
        <div className="sm:w-1/3">
          <ResourcePriceBox title="EC2 Instance" pricing="$50 per Month" />
        </div>
        <div className="sm:w-1/3">
          <ResourcePriceBox title="EC2 Instance" pricing="$50 per Month" />
        </div>
        <div className="sm:w-1/3">
          <ResourcePriceBox title="EC2 Instance" pricing="$50 per Month" />
        </div>
        <div className="sm:w-1/3">
          <ResourcePriceBox title="EC2 Instance" pricing="$50 per Month" />
        </div>
        <div className="sm:w-1/3">
          <ResourcePriceBox title="EC2 Instance" pricing="$50 per Month" />
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-6 w-full">
          <p className="mb-4">
            We hope we can show the struggle OS projects have when it comes to
            funding and issues with keeping the project alive, even if it is
            extremely popular
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
