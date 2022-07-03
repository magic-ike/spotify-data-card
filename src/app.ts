import path from 'path';
import express from 'express';
import { engine } from 'express-handlebars';
import { setupReactViews } from 'express-tsx-views';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.route';
import { HBS_HELPERS } from './config/index.config';

// express app
const app = express();

/**
 * proxies
 *
 * grabs the info provided by a reverse proxy if the express app is running behind one
 */
app.enable('trust proxy');

// view engine: handlebars
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    helpers: HBS_HELPERS
  })
);

/**
 *  view engine: tsx
 *
 * `setupReactViews()` specifies the views directory, which all view engines will use,
 * and registers tsx as the default view engine
 */
setupReactViews(app, {
  viewsDirectory: path.join(__dirname, 'views')
});

// json response formatting
app.set('json spaces', 2);

// cors
app.use(cors());

// cookie parser
app.use(cookieParser());

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// custom middleware should go here

// static files
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use(router);

export default app;
