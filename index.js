// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const admin = require("firebase-admin");

// dotenv.config(); // Load environment variables from .env file

// const app = express();
// app.use(cors());
// app.use(express.json());

// const serviceAccount = require("./caremindproject-firebase-adminsdk-ha8n9-aaa5ae4dd0.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const sendNotification = async (registrationToken, message) => {
//   const payload = {
//     notification: {
//       title: message.title,
//       body: message.body,
//     },
//   };
  
//   try {
//     const response = await admin.messaging().send({
//       token: registrationToken,
//       notification: payload.notification, 
//     });
//     console.log("Successfully sent message:", response);
//     return response;
//   } catch (error) {
//     console.error("Error sending message:", error);
//     throw error;
//   }
// };

// app.post("/send-notification", async (req, res) => {
//   const { registrationToken, title, body } = req.body;

//   if (!registrationToken || !title || !body) {
//     return res
//       .status(400)
//       .json({ error: "Registration token, title, and body are required." });
//   }

//   const message = {
//     title: title, 
//     body: body,   
//   };

//   try {
//     const response = await sendNotification(registrationToken, message); 
//     return res.status(200).json({ success: true, response });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// });

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const cron = require("node-cron");

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require("./caremindproject-firebase-adminsdk-ha8n9-aaa5ae4dd0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send notification
const sendNotification = async (registrationToken, message) => {
  const payload = {
    notification: {
      title: message.title,
      body: message.body,
    },
  };
  
  try {
    const response = await admin.messaging().send({
      token: registrationToken,
      notification: payload.notification, 
    });
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// POST endpoint to schedule notification
app.post("/schedule-notification", async (req, res) => {
  const { registrationToken, title, body, targetTime } = req.body;

  if (!registrationToken || !title || !body || !targetTime) {
    return res
      .status(400)
      .json({ error: "Registration token, title, body, and targetTime are required." });
  }

  // Parse the target time from the request
  const targetDate = new Date(targetTime);

  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({ error: "Invalid target time format." });
  }

  // Schedule the notification using node-cron
  cron.schedule('* * * * *', async () => {
    const currentTime = new Date();

    // Check if the current time matches the target time
    if (currentTime >= targetDate) {
      const message = {
        title: title,
        body: body,
      };

      try {
        const response = await sendNotification(registrationToken, message);
        console.log("Notification sent:", response);
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    }
  });

  return res.status(200).json({ success: true, message: "Notification scheduled." });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
