'use strict';

import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import request from 'superagent';

class Uploads extends Component {
    constructor() {
        super();
        this.state = {transactions: null};
    }
    componentWillMount() {
        request
        .get('/api/file')
        .end((err, res) => {
            if(err){
                console.log(err);
            }
            this.setState({
                transactions: JSON.parse(res.text)
            });
        });
    }

    renderTable() {
        if(this.state.transactions === null) {
            return;
        }
        return (
            <BootstrapTable data={ this.state.transactions } striped={true}>
            <TableHeaderColumn dataField='TransactionID' isKey={true} dataSort={true}>TransactionID</TableHeaderColumn>
            <TableHeaderColumn dataField='TransactionDate'>TransactionDate</TableHeaderColumn>
            <TableHeaderColumn dataField='Amount'>Amount</TableHeaderColumn>
            <TableHeaderColumn dataField='Description'>Description</TableHeaderColumn>
            <TableHeaderColumn dataField='StartDate'>StartDate</TableHeaderColumn>
            <TableHeaderColumn dataField='EndDate'>EndDate</TableHeaderColumn>
            <TableHeaderColumn dataField='Filename'>Filename</TableHeaderColumn>
            </BootstrapTable>
        );
    }
    render () {
        return (
            <div>
                {this.state.transactions && this.renderTable()}
            </div>
        );
    }
};

export default Uploads;
