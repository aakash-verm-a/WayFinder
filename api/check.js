// api/check.js

// 1. YOUR SECRET LOCATIONS (Hidden from the frontend)
// Added multiple locations to create a sequence

const TREASURES = [
  {
    id: "treasure_1",
    lat: 29.947631,
    lon: 76.822402, 
    radius: 100, 
    hint: "You found the first clue! Next, look under the old oak tree in the park."
  },
  {
    id: "treasure_2",
    lat: 40.7135, // Example coordinates for the second location
    lon: -74.0050, 
    radius: 20, 
    hint: "Great job! The final clue is near the town clock tower."
  },
  {
    id: "treasure_3",
    lat: 40.7140, // Example coordinates for the third location
    lon: -74.0040, 
    radius: 10, 
    hint: "Congratulations! You've found the final treasure!"
  }
];

// 2. THE MATH (Haversine formula to calculate distance in meters)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

// 3. THE API ENDPOINT
export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // We now expect 'currentStep' from the frontend (defaults to 0 if not provided)
  const { userLat, userLon, currentStep = 0 } = req.body;

  if (!userLat || !userLon) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  // Ensure the step is a valid number within our array
  if (currentStep >= TREASURES.length) {
    return res.status(200).json({ 
        found: false, 
        message: "You have already completed the treasure hunt!",
        completed: true
    });
  }

  // Grab only the treasure the user is currently supposed to be looking for
  const targetTreasure = TREASURES[currentStep];

  // Check the distance against ONLY the target treasure
  const distance = getDistance(userLat, userLon, targetTreasure.lat, targetTreasure.lon);

  if (distance <= targetTreasure.radius) {
    // User is within the radius of the CORRECT sequential treasure!
    return res.status(200).json({ 
      found: true, 
      message: targetTreasure.hint,
      nextStep: currentStep + 1, // Tell the frontend what step to ask for next time
      isGameComplete: (currentStep + 1) === TREASURES.length // Flag if they won the whole game
    });
  }

  // They are not close enough to their current target
  return res.status(200).json({ 
    found: false, 
    message: "Keep searching... you aren't quite there yet." 
  });
}