'use strict';

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const multer     = require('multer'); // Middleware to handle multiform data
const moment     = require('moment');
const csv        = require('fast-csv');
const db         = require('../db/db');
const appconfig  = require('../app.config');
const processCSV = require('./processCSV');

const api = express();

/* Store all uploaded folders in the specified CSVFOLDER */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appconfig.CSV_FOLDER);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
    }
});

const upload = multer({ storage: storage });

api.post('/file', upload.any(), (req, res) => {
    processCSV.handleFiles();
    res.status(201).send('created');
});

api.get('/file', (req, res) => {
    processCSV.selectAllTransactions((result) => {
        res.status(200).send(result);
    });
});

module.exports = api;
