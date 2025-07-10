// Next.js API route for emails - GET and POST
export default async function handler(req, res) {
  const { method } = req;
  const backendUrl = 'http://localhost:3001/api/emails';

  try {
    if (method === 'GET') {
      const response = await fetch(backendUrl);
      const data = await response.json();
      res.status(response.status).json(data);
    } else if (method === 'POST') {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 