import dotenv from 'dotenv';
import app from './app';

dotenv.config();

let port;

switch (process.env.NODE_ENV) {
  case 'dev':
    port = process.env.PORT_DEV;
    break;
  case 'test':
    port = process.env.PORT_TEST;
    break;
  default:
    port = process.env.PORT_PROD;
    break;
}

export default app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`app is listening to port ${port}`);
});
