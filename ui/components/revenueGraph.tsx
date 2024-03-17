'use client'

import React from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement);

export function RevenueGraph() {
  // Sample data for revenue change over time
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [10000, 15000, 20000, 18000, 25000, 30000],
        fill: false,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div
      className="rounded-lg border bg-card text-card-foreground shadow-sm mt-4 space-y-1.5 p-6"
      data-v0-t="card"
    >
      <h2 className="font-semibold whitespace-nowrap tracking-tight text-3xl mb-4">
        Revenue Change Over Time
      </h2>
      <div className="m-4">
        <Line data={data} options={{ maintainAspectRatio: false }} height="350px" />
      </div>
    </div>
  );
}
