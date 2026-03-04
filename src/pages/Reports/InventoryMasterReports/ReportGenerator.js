import React, { useState } from 'react';
import axios from 'axios';
import { PrivateAxios } from '../../../environment/AxiosInstance';

function ReportGenerator() {
  const [prompt, setPrompt] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await PrivateAxios.post('/product/generate-report', { prompt });
      setReport(res.data.report);
    } catch (err) {
      setReport('Error generating report: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>AI Report Generator</h2>
      <textarea
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt like: 'Generate monthly inventory report'"
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
      {report && (
        <pre style={{ marginTop: 20, background: '#f5f5f5', padding: 10 }}>
          {report}
        </pre>
      )}
    </div>
  );
}

export default ReportGenerator;