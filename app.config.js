'use strict';

/*
** App folders and files
**/

const path = require('path');

/* Folders for CSV processing */
const CSV_FOLDER        = path.join(__dirname, 'csv_uploads');
const PROCESSING_FOLDER = path.join(__dirname, 'processing');
const HISTORY_FOLDER    = path.join(__dirname, 'history');

/* HTML and js files for the app */
const CONTENT_BASE  = path.join(__dirname, 'client');
const INDEX_FILE    = path.join(CONTENT_BASE, 'index.html');
const APP_ENTRY     = path.join(CONTENT_BASE, 'index.js');
const BUILD_FOLDER  = path.join(__dirname, 'dist');

module.exports = {
    APP_FOLDERS:       [CSV_FOLDER, PROCESSING_FOLDER, HISTORY_FOLDER],
    CSV_FOLDER:        CSV_FOLDER,
    PROCESSING_FOLDER: PROCESSING_FOLDER,
    HISTORY_FOLDER:    HISTORY_FOLDER,
    CONTENT_BASE:      CONTENT_BASE,
    INDEX_FILE:        INDEX_FILE,
    APP_ENTRY:         APP_ENTRY,
    BUILD_FOLDER:      BUILD_FOLDER
};
