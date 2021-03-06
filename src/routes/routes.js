import express from 'express';
import matomo from '../controllers/matomo';
import config from '../config/config';

const route = express.Router();

route.get('/', async (req, res) => matomo(req, res));

route.post('/', async (req, res) => matomo(req, res));

route.get('/modules', async (req, res) => {
  if (process.env.NODE_ENV === 'dev') return res.status(200).json(config.matomo);
  return res.status(404).json({ error: 'Not Found' });
});

export default route;
