const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());
app.use(morgan('dev'));

app.use('/api', apiRouter);




const port = process.env.PORT || 4000;
app.listen(port, () => {console.log(`Server is listening on port ${port}`);});

module.exports = app;