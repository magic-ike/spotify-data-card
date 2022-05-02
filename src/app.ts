import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import { engine } from 'express-handlebars';
import cors from 'cors';
import pageRouter from './routes';
import apiRouter from './routes/api';

// .env files
dotenv.config();

// express app
const app = express();

// view engine (handlebars)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// cors
app.use(cors());

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', pageRouter);
app.use('/api', apiRouter);

export default app;
