
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import type { AnalysisResult } from '../types';

interface ResultsDisplayProps {
  result: AnalysisResult;
  imageSrc: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, imageSrc }) => {
  const { diagnoses, explanation, attentionArea } = result;

  const chartData = diagnoses.map(d => ({
    name: d.condition,
    Probability: parseFloat((d.probability * 100).toFixed(1)),
  }));
  
  // Sort data for better visualization
  chartData.sort((a, b) => b.Probability - a.Probability);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Side: Image with Attention Map */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">X-Ray Analysis</h2>
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img src={imageSrc} alt="Uploaded X-Ray" className="w-full h-full object-contain" />
            {attentionArea && (
              <div
                className="absolute border-4 border-red-500 bg-red-500/20 box-border rounded-md"
                style={{
                  left: `${attentionArea.x}%`,
                  top: `${attentionArea.y}%`,
                  width: `${attentionArea.width}%`,
                  height: `${attentionArea.height}%`,
                }}
                title={attentionArea.description}
              />
            )}
          </div>
           {attentionArea && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 rounded-r-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Area of Interest</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">{attentionArea.description}</p>
              </div>
            )}
        </div>

        {/* Right Side: Probabilities and Explanation */}
        <div className="p-6 flex flex-col space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Diagnosis Probabilities</h3>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: 'currentColor', fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'currentColor', fontSize: 12 }} />
                        <Tooltip
                            cursor={{ fill: 'rgba(238, 242, 255, 0.5)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="Probability" fill="#3b82f6" background={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">AI Radiologist's Report</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg max-h-60 overflow-y-auto">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{explanation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
