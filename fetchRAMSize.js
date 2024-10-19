
const axios = require('axios');
const db = require('./firebase'); 


const appToken = '5JHH4Gsag92E9Gk8joSztFYFYkj1LY2oewk0OwWN';

// Function to fetch all computers
async function fetchComputers(sessionToken) {
    try {
        const response = await axios.get(`http://13.75.147.214/apirest.php/Computer/?app_token=${appToken}&session_token=${sessionToken}`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching computers:', error.message);
        return [];
    }
}

// Function to fetch memory for a specific computer by ID
async function fetchMemory(computerId, sessionToken) {
    try {
        const response = await axios.get(`http://13.75.147.214/apirest.php/Computer/${computerId}/Item_DeviceMemory/?app_token=${appToken}&session_token=${sessionToken}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching memory for Computer ID: ${computerId}`, error.message);
        return [];
    }
}

// Function to calculate total RAM from the memory data
function calculateTotalRAM(memoryData) {
    let totalRAM = 0; 
    if (Array.isArray(memoryData)) {
        memoryData.forEach(memory => {
            totalRAM += memory.size; // Sum the sizes (in MB)
        });
    }
    return totalRAM; // Return total RAM in MB
}

// Function to send data to Firestore
async function sendDataToFirestore(computerId, serial, totalRAM) {
    const docRef = db.collection('equipment').doc(serial); // Create document reference using serial number
    await docRef.set({ // Set data in Firestore
        computerId,
        serial,
        ram: (totalRAM / 1024).toFixed(2), // Store total RAM in GB with 2 decimal places
    });
console.log(`Data for Computer ID: ${computerId} sent to Firestore.`);
}

// Function to get memory size
async function getMemorySize(computerId, sessionToken) {
    const memoryData = await fetchMemory(computerId, sessionToken); // Fetch memory for each computer
    return calculateTotalRAM(memoryData); // Calculate total RAM in MB
}

module.exports = { getMemorySize }; 
