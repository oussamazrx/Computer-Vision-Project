import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AddStudentForm.css';

function AddClassForm() {
  const [className, setClassName] = useState('');
  const [majorId, setMajorId] = useState('');
  const [promo, setPromo] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [majors, setMajors] = useState([]);
  const [professors, setProfessors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of majors from the backend
    fetch('http://localhost:5000/majors')
      .then(response => response.json())
      .then(data => setMajors(data))
      .catch(error => console.error('Error fetching majors:', error));

    // Fetch the list of professors from the backend
    fetch('http://localhost:5000/professors')
      .then(response => response.json())
      .then(data => setProfessors(data))
      .catch(error => console.error('Error fetching professors:', error));
  }, []);

  const validateInputs = () => {
    if (!className || !majorId || !promo || !coordinatorId) {
      Swal.fire('Error', 'All fields are required!', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append('name', className);
    formData.append('major_id', majorId);
    formData.append('promo', promo);
    formData.append('coordinator_id', coordinatorId);

    try {
      const response = await fetch('http://localhost:5000/add_class', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.status === 201) {
        Swal.fire('Success', result.message, 'success');
        setClassName('');
        setMajorId('');
        setPromo('');
        setCoordinatorId('');
      } else {
        Swal.fire('Error', result.error || 'There was an error processing your request!', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'There was an error adding the class!', 'error');
      console.error('Error:', error);
    }
  };

  return (
    <div className="AddStudentForm">
      <h2>Add Class</h2>
      <button
        onClick={() => navigate('/classes')}
        className="mb-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Back to Classes
      </button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <select
          value={majorId}
          onChange={(e) => setMajorId(e.target.value)}
        >
          <option value="">Select Major</option>
          {majors.map((major) => (
            <option key={major.id} value={major.id}>
              {major.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Promo (Year)"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
        />
        <select
          value={coordinatorId}
          onChange={(e) => setCoordinatorId(e.target.value)}
        >
          <option value="">Select Coordinator</option>
          {professors.map((professor) => (
            <option key={professor.id} value={professor.id}>
              {professor.name}
            </option>
          ))}
        </select>
        <button type="submit">Add Class</button>
      </form>
    </div>
  );
}

export default AddClassForm;
