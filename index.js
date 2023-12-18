const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

const verifyToken = 'abcd1234';
const accessToken = process.env['ACCESS_TOKEN'];

app.use(bodyParser.json());

// Facebook webhook verification
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === verifyToken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid verify token');
  }
});

// Handling incoming messages
app.post('/webhook', (req, res) => {
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message) {
        const messageText = 'Thank you for your message';
        sendMessage(senderId, messageText);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Function to send messages
function sendMessage(recipientId, messageText) {
  const apiUrl = `https://graph.facebook.com/v14.0/me/messages?access_token=${accessToken}`;
  const messageData = {
    recipient: { id: recipientId },
    message: { text: messageText },
  };

  axios.post(apiUrl, messageData)
    .then(response => {
      console.log('Message sent successfully:', response.data);
    })
    .catch(error => {
      console.error('Error sending message:', error.response.data);
    });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
