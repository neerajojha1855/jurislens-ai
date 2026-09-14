import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DocumentOverview from './components/DocumentOverview';
import AnalysisTabs from './components/AnalysisTabs';
import ChatAssistant from './components/ChatAssistant';
import { checkBackendHealth, uploadAndAnalyzeDocument } from './services/api';

export default function App() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    checkBackendHealth().then((res) => setIsHealthy(!!res));
  }, []);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setUploadedFile(file);
    try {
      const data = await uploadAndAnalyzeDocument(file);
      setAnalysisResult(data);
    } catch (err) {
      alert(`Error analyzing document: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setUploadedFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-legal-950 text-slate-100">
      <Header isHealthy={isHealthy} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                Decipher Complex Legal Agreements in Seconds
              </h1>
              <p className="text-sm sm:text-base text-slate-400">
                Upload your contracts, NDAs, or terms of service in <strong>.pdf</strong> or <strong>.docx</strong>. JurisLens AI translates legalese into plain English, flags hidden risks, and empowers your negotiations.
              </p>
            </div>

            <FileUpload onFileAnalyzed={handleFileUpload} isLoading={isLoading} />
          </div>
        ) : (
          <div>
            <DocumentOverview analysis={analysisResult} onReset={handleReset} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Analysis & Breakdown (Left 7 Cols) */}
              <div className="lg:col-span-7">
                <AnalysisTabs analysis={analysisResult} />
              </div>

              {/* Interactive Q&A Assistant (Right 5 Cols) */}
              <div className="lg:col-span-5">
                <div className="sticky top-28">
                  <ChatAssistant
                    documentId={analysisResult.raw_document_id}
                    documentText=""
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>JurisLens AI — Built for PromptWars Virtual (Exclusive Edition) • AI for Legal Assistance & Access</p>
      </footer>
    </div>
  );
}
