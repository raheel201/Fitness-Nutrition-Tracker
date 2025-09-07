import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressChart({ data, title, color = 'teal' }) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: '#f1f5f9',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#475569',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      y: {
        grid: {
          color: '#475569',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        borderColor: color === 'teal' ? '#14b8a6' : color === 'orange' ? '#f97316' : '#8b5cf6',
        backgroundColor: color === 'teal' ? '#14b8a6' : color === 'orange' ? '#f97316' : '#8b5cf6',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: color === 'teal' ? '#14b8a6' : color === 'orange' ? '#f97316' : '#8b5cf6',
        pointBorderColor: '#1e293b',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="h-64 w-full">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
}