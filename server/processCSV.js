'use strict';

const csv       = require('fast-csv');
const fs        = require('fs');
const path      = require('path');
const moment    = require('moment');
const _         = require('lodash');
const db        = require('../db/db');
const appconfig = require('../app.config');

exports.handleFiles = () => {
	fs.readdir(appconfig.CSV_FOLDER, (err, files) => {
		if(err) {
			console.log('could not read directory');
		}
		return processFiles(files);
	});
};

const processFiles = (files) => {
	if(files.length === 0) {
		return;
	}
	parseFileAndWriteToDb(files);
};

const parseFileAndWriteToDb = (files) => {
	// Take one file out of the array, operation mutates the array
	let file = files.pop();

	// initialize different paths for file
	let csvUploadsPathToFile = path.join(appconfig.CSV_FOLDER, file);
	let processingPathToFile = (csvUploadsPathToFile, path.join(appconfig.PROCESSING_FOLDER, file));
	let historyPathToFile = path.join(appconfig.HISTORY_FOLDER, file);

	// Move the current folder to processing sync so that we don't try to parse too early
	fs.rename(csvUploadsPathToFile, processingPathToFile);

	// Create first entry in File table with current information.
	insertIntoFileTableStart(file, (err) => {
		if(err) {
			// filename exists go to next file
			return processFiles(files);
		}

		csv.fromPath(processingPathToFile)
			.on('data', (data) => {
				// Write to db line by line
				insertIntoTransactionDescriptionTable(file, data);
			})
			.on('end', () => {
				let i;
				let count = 0;
				require('fs').createReadStream(processingPathToFile)
				.on('data', (chunk) => {
					for (i=0; i < chunk.length; ++i)
						if (chunk[i] == 10) count++;
				})
				.on('end', () => {
					// Dont't count header line.
					insertIntoFileTableEnd(file, count-1);
				});

				// Move file to history after parsing
				fs.rename(processingPathToFile, historyPathToFile);

				// Parse next file
				return processFiles(files);
			})
			.on('error', (data) => {
				console.log('Error whenn logging ' + data);
			})
	});
};

/* Calls insertIntoFileTableStart in db.js */
const insertIntoFileTableStart = (file, cb) => {
	db.checkIfFilenameExists(file, (err, result) => {
		if(err) {
			console.log('Error when fetching filename from db');
			return;
		}
		// Filename did not exist
		if (result.length === 0) {
			db.insertIntoFileTableStart(file, (err, result) => {
				if(err){
					console.log('Error when inserting file ' + file + ' to db');
					return;
				}
				return cb(0);
			});
			return;
		}
		console.log('filename already exists ' + file);
		return cb(1);
	});
};

/* Calls insertIntoTransactionDescriptionTable in db.js.
** A line is first written to the TransactionDescription table.
** After that line has finished we need to fetch the ID of the description
** and use that ID when inserting into the Transaction Table
**/
const insertIntoTransactionDescriptionTable = (filename, row) => {

	const description = row[2].trim();

	// We're not parsing the header of the file
	if(row[0].toLowerCase() === 'id')return;

	// check first if description exists
	db.selectTransactionDescriptioniPK(description, (err, result) => {
		if(err) {
			console.log('error when fetching TransactionDescriptionPK');
			return;
		}
		// does not exist insert
		if(result.length === 0) {
			db.insertIntoTransactionDescriptionTable(filename, row, (err, result) => {
				if(err) {
					console.log('error when inserting into Transaction Table');
					return;
				}

				// fetch the id of the description
				db.selectTransactionDescriptioniPK(description, (err, result) => {
					if(err) {
						console.log('Error when fetching TransactionDescriptionPK');
						return;
					}

					const tdPK = result[0].TransactionDescriptionPK;
					db.insertIntoTransactionTable(filename,row, tdPK, (err, result) => {
						if(err) {
							console.log('Error when inserting into TransactionTable');
							return;
						}
						return;
					});
				});
			});
		}
		else { //description does exist fetch id and insert into transaction
			const tdPK = result[0].TransactionDescriptionPK;
			db.insertIntoTransactionTable(filename,row, tdPK, (err, result) => {
				if(err) {
					console.log('Error when inserting into TransactionTable');
				}
				return;
			});
		}
	});
};

/* When we have parsed the first file we write the lineCount to File table */
const insertIntoFileTableEnd = (file, lineCount) => {
	db.insertIntoFileTableEnd(file, lineCount);
};

/* Fetches all transactions. This function is called in api.js */
exports.selectAllTransactions = (cb) => {
	db.selectAllTransactions((err, result) => {
		if(err)throw err;

		return cb(JSON.stringify(result));
	});
};
