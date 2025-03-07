import React, { useState } from 'react';
import axios from 'axios';
import './FileManager.css';

const FileManager = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    handleClear(false);
    if (!file) {
      setUploadStatus('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/apiv1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      setUploadStatus(response.data);
    } catch (error) {
      setUploadStatus('Error uploading file: ' + error.response.data);
    }
  };

  const handleDownload = async () => {
    handleClear(false);
    if (!downloadFilename) {
      setDownloadStatus('Please enter a filename to download.');
      return;
    }

    try {
      const response = await axios.get(`/apiv1/files/download/${downloadFilename}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress(percentCompleted);
        },
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadStatus('File downloaded successfully.');
    } catch (error) {
      setDownloadStatus('Error downloading file: ' + error.response.data);
    }
  };

  const handleClear = (clearFilename = true) => {
    setFile(null);
    setUploadStatus('');
    setDownloadFilename('');
    setDownloadStatus('');
    setUploadProgress(0);
    setDownloadProgress(0);
    if (clearFilename) {
      setDownloadFilename('');

      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  return (
    <div className="file-manager">
      <h1>File Manager</h1>
      
      <div className="upload-section">
        <h2>Upload File</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
        <p className="status">{uploadStatus}</p>
        <progress value={uploadProgress} max="100">{uploadProgress}%</progress>
      </div>

      <div className="download-section">
        <h2>Download File</h2>
        <input
          type="text"
          value={downloadFilename}
          onChange={(e) => setDownloadFilename(e.target.value)}
          placeholder="Enter filename to download"
        />
        <button onClick={handleDownload}>Download</button>
        <p className="status">{downloadStatus}</p>
        <progress value={downloadProgress} max="100">{downloadProgress}%</progress>
      </div>

      <div className="clear-section">
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
};

export default FileManager;