import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();

const PIXEL_ID = process.env.FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

app.use(express.json());

app.post('/api/track', async (req, res) => {
    const { eventName, eventData } = req.body;
      
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_source_url: eventData.page_url,
            user_data: {
              client_ip_address: req.ip,
              client_user_agent: req.headers['user-agent']
            },
            custom_data: eventData
          }]
        })
      });
      
      const responseData = await response.json();
      console.log('Facebook API response:', responseData);
      
      res.json(responseData);
    } catch (error) {
      console.error('Error sending to Facebook:', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
});

// Serve static files from public directory
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
}); 