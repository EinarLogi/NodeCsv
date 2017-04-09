'use strict';

require('dotenv').config(); // reads from .env file

const mysql     = require('mysql');
const moment    = require('moment');
const appconfig = require('../app.config');

/* Initialization of db */
const connection = mysql.createConnection({
    host     : process.env.DB_DEV_HOST,
    user     : process.env.DB_DEV_USER,
    password : process.env.DB_DEV_PASSWORD,
});

/* Create database and schema if it doesn't exist */
connection.query('CREATE DATABASE IF NOT EXISTS CSV', (err) => {
    if (err) throw err;
    connection.query('USE CSV', (err) => {
        if (err) throw err;
        connection.query('CREATE TABLE IF NOT EXISTS File('
            + 'Filename VARCHAR(255),'
            + 'TotalNumberOfRows INT(11),'
            + 'RowsWithErrors INT(11),'
            + 'StartDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
            + 'EndDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
            + 'CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
            + 'PRIMARY KEY(Filename)'
            +  ')', (err) => {
                if (err) throw err;
            });
        connection.query('CREATE TABLE IF NOT EXISTS TransactionDescription('
            + 'TransactionDescriptionPK INT(11) AUTO_INCREMENT,'
            + 'Description VARCHAR(33) NOT NULL,'
            + 'CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
            + 'PRIMARY KEY(TransactionDescriptionPK)'
            + ')', (err) => {
            if(err) throw err;
        });
        connection.query('CREATE TABLE IF NOT EXISTS Transaction('
            + 'TransactionID INT(11),'
            + 'TransactionDate DATE NOT NULL,'
            + 'Amount DECIMAL(11,2) NOT NULL,'
            + 'CreationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,'
            + 'TransactionDescriptionPK INT(11) NOT NULL,'
            + 'FilePK VARCHAR(255) NOT NULL,'
            + 'FOREIGN KEY(TransactionDescriptionPK) REFERENCES TransactionDescription(TransactionDescriptionPK),'
            + 'FOREIGN KEY(FilePK) REFERENCES File(Filename),'
            + 'PRIMARY KEY(TransactionID)'
            + ')', (err) => {
            if(err) throw err;
        });
    });
});

exports.checkIfFilenameExists = (file, cb) => {
    const query = 'SELECT filename FROM FILE WHERE FILENAME = ?';
    const query_var = [file];
    connection.query(query, query_var, (err, results) => {
        if(err) {
            return cb(err,null);
        }
        //console.log('results from db func:', results);
        return cb(null,results);
    });
};

/* Creates entry for File table */
exports.insertIntoFileTableStart = (file, cb) => {
    // Prepare query
    const query = 'INSERT INTO File SET Filename = ?';
    const query_var = [file];

    connection.query(query, query_var, (err, results) => {
        if(err) {
            return cb(err,null);
        }
        return cb(null,results);
    });
};

/* Updates File table */
exports.insertIntoFileTableEnd = (filename, lineCount) => {
    return new Promise((resolve, reject) => {
        // Prepare query
        const query = 'UPDATE File SET TotalNumberOfRows = ? '
            + 'WHERE Filename = ?';
        const query_var = [lineCount, filename];

        connection.query(query, query_var, (error, results) => {
            if (error) {
                console.log(error);
            }
        });
    });
};

/* Create entry in TransactionDescription table */
exports.insertIntoTransactionDescriptionTable = (filename, row, cb) => {

    // Initialize params
    // Trim trailing spaces
    const description = row[2].trim();

    // Prepare query
    const query = 'INSERT INTO TransactionDescription '
        + 'SET Description = ?';
    const query_var = [description];

    connection.query(query, query_var, (error, rows, fields) => {
        if (error) {
            return cb(error,null);
        }
        return cb(null,rows);
    });
};

/* Find TransactionDescriptionPK from TransactionDescription */
exports.selectTransactionDescriptioniPK = (description, cb) => {

    // Prepare query
    const query = 'SELECT TransactionDescriptionPK '
        + 'FROM TransactionDescription '
        + 'WHERE Description = ?';
    const query_var = [description]

    connection.query(query, query_var, (err, rows) => {
        if (err) {
            console.log(err);
            return cb(err,null);
        }
        return cb(null,rows);
    });
};

/* Creates entry in Transaction table */
exports.insertIntoTransactionTable = (filename, row, tdPK, cb) => {

    // Initialize params
    const trID = row[0];
    const date = row[1];
    const amount = row[3];

    // Prepare query
    const query = 'INSERT INTO Transaction '
        + 'SET TransactionID = ?, TransactionDate = ?, Amount = ?, '
        + 'TransactionDescriptionPK = ?, FilePK = ?';
    const query_var = [trID, date, amount, tdPK, filename]

    connection.query(query, query_var, (err, rows) => {
        if (err) {
            console.log(err);
            return cb(err,null);
        }
        return cb(null,rows);
    });
};

/* Fetch all transactions to display in the view */
exports.selectAllTransactions = (cb) => {

    // Prepare query
    const query = 'SELECT Transaction.TransactionID, Transaction.TransactionDate, '
        + 'Transaction.Amount, TransactionDescription.Description, File.StartDate, '
        + 'File.EndDate, File.Filename '
        + 'FROM Transaction, TransactionDescription, File '
        + 'WHERE Transaction.TransactionDescriptionPK = TransactionDescription.TransactionDescriptionPK '
        + 'AND Transaction.FilePK = File.Filename';


    connection.query(query, (err, rows) => {
        if (err) {
            console.log(err);
            return cb(err,null);
        }
        return cb(null,rows);
    });
};
