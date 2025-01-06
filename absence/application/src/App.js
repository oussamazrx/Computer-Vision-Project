import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/login';
import Dashboard from './components/Dashboard';
import AddStudentForm from './components/AddStudentForm';
import Students from './components/Students';
import ClassList from './components/ClassList';
import FaceRecognitionApp from './components/FaceRecognitionApp';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add_student" element={<AddStudentForm />} />
            <Route path="/students" element={<Students />} />
            <Route path="/classes" element={<ClassList />} />
            <Route path="/face-recognition" element={<FaceRecognitionApp />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;