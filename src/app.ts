import path from 'path';
import express from 'express';
import { engine } from 'express-handlebars';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pageRouter from './routes/index.route';
import authRouter from './routes/auth/index.route';
import cardRouter from './routes/card/index.route';

// express app
const app = express();

// view engine (handlebars)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

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
app.use('/card', cardRouter);
app.use((_req, res) => res.sendStatus(404));

export default app;
