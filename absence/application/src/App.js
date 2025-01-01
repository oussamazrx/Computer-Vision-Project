import React, { useState, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import './App.css';

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [className, setClassName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImagePreview(imageSrc);
    setImage(dataURLtoFile(imageSrc, 'capture.png'));
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const validateInputs = () => {
    if (!firstName || !lastName || !email || !phone || !className || !image) {
      setMessage('All fields are required!');
      setIsError(true);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Invalid email address!');
      setIsError(true);
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      setMessage('Phone number must be 10 digits!');
      setIsError(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('class', className);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/add_student', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
      setIsError(false);
      // Clear form after successful submission
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setClassName('');
      setImage(null);
      setImagePreview(null);
      setUseWebcam(false);
    } catch (error) {
      setMessage('There was an error adding the student!');
      setIsError(true);
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <h1>Ajouter un étudiant</h1>
      {message && (
        <div className={`message ${isError ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Classe"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <div className="image-upload">
          {!useWebcam ? (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <button type="button" onClick={() => setUseWebcam(true)}>
                Use Webcam
              </button>
            </>
          ) : (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                width={320}
                height={240}
              />
              <button type="button" onClick={captureImage}>
                Capture
              </button>
              <button type="button" onClick={() => setUseWebcam(false)}>
                Upload Image
              </button>
            </>
          )}
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
        </div>
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default App;