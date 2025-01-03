// import React, { useState, useRef } from 'react';
// import Webcam from 'react-webcam';
// import Swal from 'sweetalert2';  // Import SweetAlert2
// import './App.css';

// function App() {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [className, setClassName] = useState('');
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [useWebcam, setUseWebcam] = useState(false);
//   const webcamRef = useRef(null);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const captureImage = () => {
//     const imageSrc = webcamRef.current.getScreenshot();
//     setImagePreview(imageSrc);
    
//     // Generate a custom file name using the first and last name
//     const customFileName = `${firstName}_${lastName}.png`;  // Custom name using first and last name
//     setImage(dataURLtoFile(imageSrc, customFileName));  // Pass the custom filename
//   };

//   const dataURLtoFile = (dataurl, filename) => {
//     const arr = dataurl.split(',');
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) {
//       u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new File([u8arr], filename, { type: mime });
//   };

//   const validateInputs = () => {
//     if (!firstName || !lastName || !email || !phone || !className || !image) {
//       Swal.fire('Error', 'All fields are required!', 'error');
//       return false;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       Swal.fire('Error', 'Invalid email address!', 'error');
//       return false;
//     }
//     if (!/^\d{10}$/.test(phone)) {
//       Swal.fire('Error', 'Phone number must be 10 digits!', 'error');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateInputs()) return;

//     const formData = new FormData();
//     formData.append('first_name', firstName);
//     formData.append('last_name', lastName);
//     formData.append('email', email);
//     formData.append('phone', phone);
//     formData.append('class', className);
//     formData.append('image', image);

//     try {
//       const response = await fetch('http://localhost:5000/add_student', {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();

//       if (response.status === 200) {
//         // Student added successfully
//         Swal.fire('Success', result.message, 'success');
//         // Clear form after successful submission
//         setFirstName('');
//         setLastName('');
//         setEmail('');
//         setPhone('');
//         setClassName('');
//         setImage(null);
//         setImagePreview(null);
//         setUseWebcam(false);
//       } else {
//         // Something went wrong (response.status !== 200)
//         Swal.fire('Error', result.error || 'There was an error processing your request!', 'error');
//       }
//     } catch (error) {
//       // Catch errors from the request
//       Swal.fire('Error', 'There was an error adding the student!', 'error');
//       console.error('Error:', error);
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Ajouter un étudiant</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Prénom"
//           value={firstName}
//           onChange={(e) => setFirstName(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Nom"
//           value={lastName}
//           onChange={(e) => setLastName(e.target.value)}
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Téléphone"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Classe"
//           value={className}
//           onChange={(e) => setClassName(e.target.value)}
//         />
//         <div className="image-upload">
//           {!useWebcam ? (
//             <>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />
//               <button type="button" onClick={() => setUseWebcam(true)}>
//                 Use Webcam
//               </button>
//             </>
//           ) : (
//             <>
//               <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/png"
//                 width={320}
//                 height={240}
//               />
//               <button type="button" onClick={captureImage}>
//                 Capture
//               </button>
//               <button type="button" onClick={() => setUseWebcam(false)}>
//                 Upload Image
//               </button>
//             </>
//           )}
//           {imagePreview && (
//             <img src={imagePreview} alt="Preview" className="image-preview" />
//           )}
//         </div>
//         <button type="submit">Ajouter</button>
//       </form>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/Dashboard';
import AddStudentForm from './components/AddStudentForm';
import Students from './components/Students';
import ClassList from './components/ClassList';

function App() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/classes')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setClasses(data);
      })
      .catch(error => console.error('Error fetching classes:', error));
  }, []);

  const handleSelectClass = (classId) => {
    setSelectedClass(classId);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add_student" element={<AddStudentForm />} />
        <Route path="/students" element={<Students classFilter={selectedClass} />} />
        <Route path="/classes" element={<ClassList classes={classes} onSelectClass={handleSelectClass} />} />
      </Routes>
    </Router>
  );
}

export default App;