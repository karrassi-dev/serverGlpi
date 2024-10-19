
const axios = require('axios');
const db = require('./firebase'); // Import the Firestore instance
const { getMemorySize } = require('./fetchRAMSize'); // Import the memory fetching functions

const glpiUrl = 'http://13.75.147.214/apirest.php';
const appToken = '5JHH4Gsag92E9Gk8joSztFYFYkj1LY2oewk0OwWN';
const credentials = {
    login: 'glpi',
    password: 'glpi'
};

// Initialize session with GLPI API
async function initSession() {
    try {
        const response = await axios.post(`${glpiUrl}/initSession`, credentials, {
            headers: {
                'App-Token': appToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.session_token) {
            console.log('Session initialized:', response.data.session_token);
            return response.data.session_token;
        } else {
            throw new Error('Failed to obtain session token.');
        }
    } catch (error) {
        console.error('Error initializing session:', error);
        throw error;
    }
}


async function fetchDataFromGLPI() {
    const sessionToken = await initSession(); // Get session token before making requests

    try {
        // Fetch the list of computers from the correct endpoint
        const response = await axios.get(`${glpiUrl}/search/Computer`, {
            params: {
                app_token: appToken,
                session_token: sessionToken
            }
        });

        const computers = response.data.data;
        console.log(`Total Computers: ${computers.length}`);

        // Loop through each computer and fetch data
        for (const computer of computers) {
            const serialNumber = computer["5"] || 'N/A'; // Get serial number
            const computerId = computers.indexOf(computer); // Use index directly

            // Get memory size for each computer
            const totalRAM = await getMemorySize(computerId, sessionToken); // Assuming getMemorySize returns the size in MB
            const ramSizeGB = (totalRAM / 1024).toFixed(2).toString(); // Convert MB to GB

            // Prepare equipment data for Firestore
            const equipment = {
                added_by: "Xvwm0hACWCe4rnZYMI5RF3sHZx82",
                brand: computer["1"] || 'N/A',
                comment: computer.comment || 'N/A',
                department: "DOSI",
                email: "test@gmail.com",
                end_time: "",
                external_screen: computer.external_screen || 'N/A',
                inventory_number_ecr: computer.inventory_number_ecr || 'N/A',
                inventory_number_lpt: computer.inventory_number_lpt || 'N/A',
                location: computer.location || 'N/A',
                model: computer["40"] || 'N/A',
                name: computer["1"] || 'N/A',
                os: computer["45"] || 'N/A',
                processor: computer["17"] || 'N/A',
                ram: ramSizeGB,
                reference: computer.reference || 'N/A',
                screen_brand: computer.screen_brand || 'N/A',
                screen_serial_number: computer.screen_serial_number || 'N/A',
                serial_number: serialNumber,
                site: "canal",
                start_time: "",
                status: computer.status || 'N/A',
                timestamp: new Date(),
                type: computer["4"] || 'N/A',
                user: computer.user || 'N/A',
                wireless_mouse: computer.wireless_mouse || 'N/A'
            };

            const docRef = db.collection('equipment').doc(serialNumber);
            const docSnapshot = await docRef.get();

            if (!docSnapshot.exists) {
                await docRef.set(equipment);
                console.log(`Added new equipment with serial number: ${serialNumber}`);
            } else {
                await docRef.update(equipment);
                console.log(`Updated existing equipment with serial number: ${serialNumber}`);
            }
        }

        console.log('Data sent to Firebase successfully!');
    } catch (error) {
        console.error('Error fetching data from GLPI or sending to Firebase:', error);
    }
}

// Set interval for polling GLPI data every 30 seconds
const POLLING_INTERVAL = 30000;
setInterval(fetchDataFromGLPI, POLLING_INTERVAL);
