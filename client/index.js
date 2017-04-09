'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router'
import App from './App';
import Uploads from './Uploads';

render ((
	<Router history={browserHistory}>
	<Route path = '/' component={App } />
	<Route path='/uploads' component={Uploads} />
	</Router>
),document.getElementById('root'));
