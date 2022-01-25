const express = require ('express');
const app = require('../server');
const apiRouter = express.Router();
const artistsRouter = require('./artists');
const seriesRouter = require('./series');

apiRouter.use('/artists', artistsRouter);
apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;