// Next.js API route for individual email by ID - GET
export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  // TODO: change to use the backend url from the environment variable
  const backendUrl = `http://localhost:3001/api/emails/${id}`;

  try {
    if (method === 'GET') {
      const response = await fetch(backendUrl);
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 