import React, { useRef, useState, useEffect, useCallback } from 'react';

const FaceRecognitionApp = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [recognizedFaces, setRecognizedFaces] = useState([]);
  const [databaseRecords, setDatabaseRecords] = useState([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [autoCapture, setAutoCapture] = useState(false);
  const [error, setError] = useState(null);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      // Only stop existing stream if we're starting a new one
      if (stream) {
        return; // Don't reinitialize if we already have a stream
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            setStream(mediaStream);
            setError(null);
          } catch (error) {
            console.error('Error playing video:', error);
          }
        };
      }
    } catch (error) {
      setError('Failed to access camera. Please make sure camera permissions are granted.');
      console.error('Camera error:', error);
    }
  }, [stream]);

  // Fetch all records from database
  const fetchDatabaseRecords = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/check-ins');
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      const data = await response.json();
      setDatabaseRecords(data.check_ins || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      setError('Failed to fetch database records');
    }
  }, []);

  // Capture and process image
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsRecognizing(true);
      setIsLoading(true);
      setError(null);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Ensure proper canvas dimensions
      const width = video.videoWidth || video.clientWidth;
      const height = video.videoHeight || video.clientHeight;
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Clear canvas before drawing
      context.clearRect(0, 0, width, height);
      context.drawImage(video, 0, 0, width, height);

      // Get base64 data first
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64Data = dataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      // Create blob from byte arrays
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });

      // Create FormData and append blob
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpeg');

      const response = await fetch('http://127.0.0.1:5000/api/recognize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Recognition result:', result);
      
      if (result.recognized_faces && result.recognized_faces.length > 0) {
        const recognizedFace = result.recognized_faces[0];
        const [date, time] = recognizedFace.timestamp.split(' ');
        
        const newFace = {
          name: recognizedFace.name,
          timestamp: time,
          date: date
        };
        
        setRecognizedFaces(prev => [...prev, newFace]);
        await fetchDatabaseRecords();
      } else {
        setError('No face detected');
      }
    } catch (error) {
      console.error('Capture error:', error);
      setError('Failed to process image: ' + error.message);
    } finally {
      setIsRecognizing(false);
      setIsLoading(false);
    }
  }, [fetchDatabaseRecords]);

  // Initialize component
  useEffect(() => {
    startCamera();
    fetchDatabaseRecords();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };
  }, [startCamera, fetchDatabaseRecords]);

  // Handle auto-capture
  useEffect(() => {
    let interval;
    if (autoCapture) {
      interval = setInterval(captureImage, 3000);
    }
    return () => clearInterval(interval);
  }, [autoCapture, captureImage]);

  // Clear session data
  const clearAllFaces = () => {
    setRecognizedFaces([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Camera Section */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Face Recognition Camera</h2>
              <div className="relative rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  style={{ display: 'none' }}
                />
                
                {(isRecognizing || isLoading) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-lg font-semibold">
                      {isRecognizing ? 'Recognizing Face...' : 'Processing...'}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => setAutoCapture(!autoCapture)}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    autoCapture ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
                >
                  {autoCapture ? 'Stop Auto Capture' : 'Start Auto Capture'}
                </button>
                <button
                  onClick={captureImage}
                  disabled={isRecognizing || isLoading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 
                    text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Capture Now
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('live')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    activeTab === 'live' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  Live Session
                </button>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    activeTab === 'database' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  Database Records
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Time</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'live' ? (
                      recognizedFaces.map((face, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3">{face.name}</td>
                          <td className="px-4 py-3">{face.timestamp}</td>
                          <td className="px-4 py-3">{face.date}</td>
                        </tr>
                      ))
                    ) : (
                      databaseRecords.map((record, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3">{record.name}</td>
                          <td className="px-4 py-3">{record.timestamp}</td>
                          <td className="px-4 py-3">{record.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={clearAllFaces}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                >
                  Clear Session
                </button>
                <button
                  onClick={fetchDatabaseRecords}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                >
                  Refresh Records
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionApp;