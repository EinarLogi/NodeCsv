'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router'
import Dropzone from 'react-dropzone';
import request from 'superagent';

class App extends Component {
	onDrop(files) {
		let formData = new FormData();
		for(let i = 0; i < files.length; i++) {
			formData.append('file',files[i]);
		}

		request.post('/api/file')
		  .send(formData)
		  .end((err, res) => {
		    if(err){
		    	console.log(err);
		    }
		  });
	}
	render() {
	    return (
			<div>
				<h1>Upload</h1>
				<Dropzone onDrop={this.onDrop}>
					<div>Drop files or click to select</div>
				</Dropzone>
				<Link to="/uploads">Uploads</Link>
			</div>
	    );
	  }
	}

export default App;
