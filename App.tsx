
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeImage } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageAnalysis = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Image = (reader.result as string).split(',')[1];
        if (!base64Image) {
          throw new Error("Failed to read image data.");
        }
        
        setImagePreview(reader.result as string);
        
        const result = await analyzeImage(base64Image, file.type);
        setAnalysisResult(result);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the selected file.');
      setIsLoading(false);
    };
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
    setImagePreview(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 1a1 1 0 00-1 1v1h2V6H7zm-1 4v1h2v-1H6zm1 2a1 1 0 00-1 1v1h2v-1a1 1 0 00-1-1zm3-2v1h2v-1h-2zm-3-2V8h2v1H7zm5-1v1h2V8h-2zm-2 4h2v-1h-2v1z" clipRule="evenodd" />
              <path d="M11 6H9v1h2V6zm-2 2H7v1h2V8zm2 0h2v1h-2V8zm-2 2H7v1h2v-1zm2 0h2v1h-2v-1z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              AI Medical Image Classifier
            </h1>
          </div>
          {(imagePreview || isLoading) && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {!imagePreview && !isLoading && (
            <ImageUploader onImageUpload={handleImageAnalysis} disabled={isLoading} />
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Analyzing X-Ray Image...</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">AI is processing the data. This may take a moment.</p>
            </div>
          )}

          {error && (
            <div className="p-4 my-4 text-sm text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg" role="alert">
              <span className="font-medium">Analysis Error:</span> {error}
            </div>
          )}

          {analysisResult && imagePreview && !isLoading && (
            <ResultsDisplay result={analysisResult} imageSrc={imagePreview} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
