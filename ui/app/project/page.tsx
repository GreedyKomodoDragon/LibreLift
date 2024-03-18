import ResourcePriceBox from "@/components/resourcePriceBox";
import React from "react";

const ProjectPage = () => {
  // Example data for the project
  const projectName = "Your Project Name";
  const funding = "$10,000";
  const subscribers = 500;
  const resources = [
    { name: "EC2 Instances", count: 5 },
    { name: "RDS Databases", count: 2 },
    { name: "S3 Buckets", count: 10 },
    // Add more resources as needed
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{projectName}</h1>

      <div className="flex justify-between">
        {/* Project Information */}
        <div className="w-full pr-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Project Information</h2>
            <p>
              <strong>Funding:</strong> {funding}
            </p>
            <p>
              <strong>Subscribers:</strong> {subscribers}
            </p>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resources Required</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource, index) => (
                // eslint-disable-next-line react/jsx-key
                <ResourcePriceBox
                  title={resource.name}
                  pricing={String(resource.count)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
