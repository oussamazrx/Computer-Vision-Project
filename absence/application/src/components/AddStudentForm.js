import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import './AddStudentForm.css';

function AddStudentForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of classes from the backend
    fetch('http://localhost:5000/classes')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched classes:', data); // Log the fetched classes
        setClasses(data);
      })
      .catch(error => console.error('Error fetching classes:', error));
  }, []);

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
    
    const customFileName = `${firstName}_${lastName}.png`;
    setImage(dataURLtoFile(imageSrc, customFileName));
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
    if (!firstName || !lastName || !email || !phone || !classId || !image) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire('Error', 'Invalid email address!', 'error');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      Swal.fire('Error', 'Phone number must be 10 digits!', 'error');
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
    formData.append('class_id', classId);
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/add_student', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.status === 200) {
        Swal.fire('Success', result.message, 'success');
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setClassId('');
        setImage(null);
        setImagePreview(null);
        setUseWebcam(false);
      } else {
        Swal.fire('Error', result.error || 'There was an error processing your request!', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'There was an error adding the student!', 'error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="AddStudentForm">
      <h2>Add Student</h2>
      <button
        onClick={() => navigate('/students')}
        className="mb-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Back to Students
      </button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
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
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </select>
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
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default AddStudentForm;