import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/routes';

export default (() => {
  const app = express();

  app.use(bodyParser.json());

  app.use(routes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
})();
