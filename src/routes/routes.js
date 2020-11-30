import express from 'express';
import matomo from "../controllers/matomo";

const route = express.Router();

route.get('/', async (req, res) => {
  return await matomo(req, res);
  
});

export default route;

