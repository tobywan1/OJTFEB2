// UserPage.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';  // Import the Modal component
import { serverURL } from './config';

Modal.setAppElement('#root');

const UserPage = () => {
  const [userTollGateData, setUserTollGateData] = useState([]);
  const [adminPageData, setAdminPageData] = useState([]);
  const [calculatorFormData, setCalculatorFormData] = useState({
    expressway: '',
    entry: '',
    exit: '',
    vehicleClass: '',
    vehicle: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${serverURL}/getAllData`, {
        method: 'GET',
        headers: {
          'X-User-Role': 'user',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUserTollGateData(data.userTollGateData);
        setAdminPageData(data.adminPageData);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  

  const handleCalculatorInputChange = (e) => {
    setCalculatorFormData({ ...calculatorFormData, [e.target.name]: e.target.value });
  };

  const handleCalculate = () => {
    // Implement your pricing calculation logic here based on the userTollGateData and calculatorFormData
    const matchingToll = userTollGateData.find(toll => toll.expressway === calculatorFormData.expressway
      && toll.entry === calculatorFormData.entry
      && toll.exit === calculatorFormData.exit
      && toll.vehicleClass === calculatorFormData.vehicleClass
      && toll.vehicle === calculatorFormData.vehicle);

    if (matchingToll) {
      // Use the toll-specific price if available, otherwise use a default price (e.g., $1.00)
      const calculatedPrice = matchingToll.price || 1.0;
      setCalculatedPrice(calculatedPrice);
    } else {
      setCalculatedPrice(null); // No matching toll found
    }

    setIsModalOpen(true);
  };

  const getUniqueValues = (key) => {
    return Array.from(new Set(userTollGateData.map((dataItem) => dataItem[key])));
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Your Toll Gate Data</h1>
      {userTollGateData.map((dataItem, index) => (
        <div key={index}>
          {dataItem.expressway}, {dataItem.entry}, {dataItem.exit}, ...
        </div>
      ))}

      <h1>Admin Page Data</h1>
      {adminPageData.map((dataItem, index) => (
        <div key={index}>
          {dataItem.adminProperty1}, {dataItem.adminProperty2}, ...
        </div>
      ))}

      <div>
        <h2>Expressway Calculator</h2>
        <form>
          <label>Expressway:</label>
          <select name="expressway" value={calculatorFormData.expressway} onChange={handleCalculatorInputChange}>
            <option value="">Select...</option>
            {userTollGateData.map((toll) => (
              <option key={toll.id} value={toll.expressway}>
                {toll.expressway}
              </option>
            ))}
          </select>

          <label>Entry:</label>
          <select name="entry" value={calculatorFormData.entry} onChange={handleCalculatorInputChange}>
            <option value="">Select...</option>
            {getUniqueValues('entry').map((entry, index) => (
              <option key={index} value={entry}>
                {entry}
              </option>
            ))}
          </select>

          <label>Exit:</label>
          <select name="exit" value={calculatorFormData.exit} onChange={handleCalculatorInputChange}>
            <option value="">Select...</option>
            {getUniqueValues('exit').map((exit, index) => (
              <option key={index} value={exit}>
                {exit}
              </option>
            ))}
          </select>

          <label>Vehicle Class:</label>
          <select name="vehicleClass" value={calculatorFormData.vehicleClass} onChange={handleCalculatorInputChange}>
            <option value="">Select...</option>
            {getUniqueValues('vehicleClass').map((vehicleClass, index) => (
              <option key={index} value={vehicleClass}>
                {vehicleClass}
              </option>
            ))}
          </select>

          <label>Vehicle:</label>
          <select name="vehicle" value={calculatorFormData.vehicle} onChange={handleCalculatorInputChange}>
            <option value="">Select...</option>
            {getUniqueValues('vehicle').map((vehicle, index) => (
              <option key={index} value={vehicle}>
                {vehicle}
              </option>
            ))}
          </select>

          <button type="button" onClick={handleCalculate}>
            Calculate Price
          </button>
        </form>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          content: {
            width: '10%',  // Adjust the width to your preference
            height: '20%',
            margin: 'auto',
            backgroundColor: 'lightgray',  // Change to your preferred background color
            padding: '20px',
            borderRadius: '10px',  // Optional: Add rounded corners
            border: '2px solid black', 
          },
        }}
      >
        <h2> Price</h2>
        <p style={{ fontSize: '18px' }}>{calculatedPrice ? `$${calculatedPrice.toFixed(2)}` : 'No price calculated'}</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default UserPage;
