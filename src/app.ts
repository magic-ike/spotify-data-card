import path from 'path';
import express from 'express';
import { engine } from 'express-handlebars';
import { setupReactViews } from 'express-tsx-views';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pageRouter from './routes/index.route';
import authRouter from './routes/auth/index.route';
import apiRouter from './routes/api/index.route';

// express app
const app = express();

// view engine: handlebars
app.engine(
  '.hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main.view.hbs',
    helpers: {
      title: 'Spotify Data Card',
      areEqual: (a: any, b: any) => a === b
    }
  })
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// view engine: tsx
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

// static files
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use((_req, res) => res.sendStatus(404));

export default app;
