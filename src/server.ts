import express from 'express';
import cors from 'cors';
import { enable } from 'colors';
import admin from 'firebase-admin';
import AuthRouter from './routes/auth';
import SearchRouter from './routes/search';
import UpdateRouter from './routes/update';
import Madlogger, { log } from './middlewares/logger';
import { createContainers, createDatabase, getClient } from './database';
enable();

const client = getClient();

await createDatabase(client);
await createContainers(client);

const serviceAccountKey = require('../serviceAccountKey.json');
const app = express();

admin.initializeApp({
	credential: admin.credential.cert(serviceAccountKey),
});

app.set('port', process.env.PORT || 3000);
app.set('client', client);

app.use(express.json());
app.use(Madlogger('dev'));
app.use(cors());
app.use('/auth', AuthRouter);
app.use('/search', SearchRouter);
app.use('/update', UpdateRouter);
log(['Server'.green], 0);
app.listen(app.get('port'), () => {
	log([`Port:${app.get('port')}`], 1);
});
