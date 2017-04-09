'use strict';

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const webpack    = require('webpack');
const bodyParser = require('body-parser');
const _          = require('lodash');
const api        = require('./api');
const db         = require('../db/db');
const appconfig  = require('../app.config');
const config     = require('../webpack.config');

const compiler   = webpack(config);
const PORT       = process.env.port || 3030;

const app = express();


/* MIDDLEWARE */
app.use('/api', api);
app.use(bodyParser.json());

/* DEV MODE */
app.use(require('webpack-dev-middleware')(compiler, {
	noInfo: true,
	publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

app.get('*', (req, res) => {
	res.sendFile(appconfig.INDEX_FILE);
});

app.listen(PORT, (err) => {
	if (err) {
		throw err;
	}
	initialize();
});

const initialize = () => {
	console.log('initializing...');
	console.log('Initializing folders');

	_.forEach(appconfig.APP_FOLDERS, (folder) => {
		createDirectories(folder);
	});
};

const createDirectories = (folder) => {
	try {
		fs.lstatSync(folder).isDirectory();
	} catch(err) {
		fs.mkdirSync(folder);
	}
}
