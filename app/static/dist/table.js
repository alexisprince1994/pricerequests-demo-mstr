function TableManager(tableId, columns, newRowDefaults) {
  this.tableId = tableId;
  this.columns = columns;
  this.newRowDefaults = newRowDefaults;

  // Derived or calculated attributes for use later.
  this.userUTCOffset = moment().utcOffset() * -1;
  this.tracker = new IndexChangeTracker();
  
  this.editableColumnDefs = defineEditableColumns(this.columns);
  

  // Helpful mapping referenced to map column index to name
  this.indexToName = {};
  for (var i = 0; i < columns.length; i++) {
    this.indexToName[i] = columns[i].data;
  };

  
  /*
  PRIVATE METHODS UTILITY METHODS
  */


  this._buildDataTable = function({scrollY="60vh", paging=false, searching=false, scrollX=true }) {
    const that = this;
    const $table = $('#' + that.tableId).DataTable({
      "columns": that.columns,
      "scrollY": scrollY,
      "scrollCollapse": true,
      "scrollX": scrollX,
      "paging": paging,
      "searching": searching,
      
      "columnDefs": [
      {"render": function(data, type, row) {
        if (data) {
          // var checkboxHtml = '<form><div class="checkbox checkbox-inline checkbox-primary"><input type="checkbox" checked><label></label></div></form>';
          var checkboxHtml = '<div class="checkbox checkbox-inline checkbox-primary"><input type="checkbox" checked><label></label></div>';
        } else {
          
          // var checkboxHtml = '<form><div class="checkbox checkbox-inline checkbox-primary"><input type="checkbox"><label></label></div></form>';
          var checkboxHtml = '<div class="checkbox checkbox-inline checkbox-primary"><input type="checkbox"><label></label></div>';
          }
        return checkboxHtml;
      }, "targets": that.editableColumnDefs.editableBooleanColumns
    },
      {"render": function(data, type, row) {
        if (data) {
          var checkboxHtml = '<div class="checkbox checkbox-inline checkbox-primary"><input type="checkbox" checked="checked" disabled="disabled"><label></label></div>';
        } else {
          var checkboxHtml = '<div class="checkbox checkbox-inline checkbox-primary"><input type="checkbox" disabled="disabled"><label></label></div>';
        }
        return checkboxHtml;
      }, "targets": that.editableColumnDefs.readOnlyBooleanColumns}
      ],
    });
    return $table;
  }

  this._applyReadOnlyStyle = function() {
    const readOnlyColumns = this.editableColumnDefs.allReadOnlyColumns;
    const that = this;
    for (var i = 0; i < readOnlyColumns.length; i++) {
      if (that.$table.column(readOnlyColumns[i]).nodes().to$().hasClass('noclick')) {
        that.$table.column(readOnlyColumns[i]).nodes().to$().removeClass('noclick');
      }

      that.$table.column(readOnlyColumns[i]).nodes().to$().addClass('noclick')
    }
    
  }

  this._isChecked = function(rowIndex, columnIndex) {
    const checked = this.$table.cell(rowIndex, columnIndex).nodes()
      .to$().find("input").prop("checked");

      return checked;
  };

  this._toChecked = function(rowIndex, columnIndex, toCheck) {
    // If current checkbox is checked, bail to not unnecessarily manipulate the dom
    // otherwise change checkbox status.
    const $checkbox = this.$table.cell(rowIndex, columnIndex).nodes().to$().find("input");
    const checked = $checkbox.is(":checked");
    console.log('checked variable is ' + checked + ' and toCheck is ' + toCheck);

    if (checked == toCheck) {
      return;
    } else {
      $checkbox.prop('checked', !checked);
    }
  };

  this._convertToLocal = function (timestamp) {
    const formattedDate = moment.utc(timestamp, 'X').local().format('YYYY-MM-DD h:mm:ss A');
    return formattedDate;
  }

  this._convertRowToLocal = function(row) {
    if (this.editableColumnDefs.timestamps.length == 0) {
      return row;
    } else {
      const transformedRow = row;
      for (var i = 0; i < this.editableColumnDefs.timestamps.length; i++) {
        const currentTimestampColumnName = this.indexToName[this.editableColumnDefs.timestamps[i]];
        const currentRowTimestamp = moment.unix(row[currentTimestampColumnName]);
        transformedRow[currentTimestampColumnName] = this._convertToLocal(currentRowTimestamp);
      }
      return transformedRow;
    }
  };

  this._convertToTimestamp = function(momentInstance) {
    return moment(momentInstance).format('X');
  }

  this._convertRowToTimestamp = function(row) {
    if (this.editableColumnDefs.timestamps.length == 0) {
      return row;
    } else {
      this.editableColumnDefs.timestamps.forEach(function(tsIndex) {
        const tsColName = this.indexToName[tsIndex];
        const currentRowMoment = moment(row[tsColName], 'YYYY-MM-DD h:mm:ss A');
        row[tsColName] = this._convertToTimestamp(currentRowMoment);
      }, this);
    }
    return row;
  }

  this._nextEditableColumn = function(colIndx) {
    const greaterColumnIndexes = this.editableColumnDefs.editableColumns.filter(col => col > colIndx).sort();
    if (greaterColumnIndexes.length > 0) {
      return greaterColumnIndexes[0];
    } else {
      return -1;
    }
  }

  this._tabToNextEditable = function(colIndx) {

    const nextEditableColumn = this._nextEditableColumn(this.editableColumnDefs.editableColumns[colIndx]);

    that = this;
    $(that.$table.column(that.editableColumnDefs.editableColumns[colIndx]).nodes()).bind('keydown', function(e) {
      
      if (e.keyCode == 9) {
        e.preventDefault();
        $(this).find("input").submit();
        // If there is another editable column in the table
        // double clicks that to begin editing. Otherwise, bails.
        if (nextEditableColumn != -1) {
          const rowBeingEdited = that.$table.row(this).index();
          const columnBeingEdited = that.$table.column(this).index();
          that.$table.cell(rowBeingEdited, nextEditableColumn).nodes().to$().dblclick();
        }
      }
    });
  }

  this._loadUpdatedData = function(response) {
    

    response.forEach(function(serverRow) {
      
      const rowIndx = serverRow['dt_index'];
      const $row = this.$table.row(rowIndx);
      if (serverRow['modified_ok']) {
        const localServerRow = this._convertRowToLocal(serverRow['server_data']);
        $row.data(localServerRow);
        this.removeErrorMessage($row);

        // Appropriately checks the check boxes for boolean columns.
        this.editableColumnDefs.booleanColumns.forEach(function(boolColIndx) {
          const boolColName = this.indexToName[boolColIndx];
          this._toChecked(rowIndx, boolColIndx, localServerRow[boolColName]);
        }, this);
      } else {
        this.addErrorMessage($row, serverRow['error']);
        this.dataHasErrors = true;
      }
    }, this);    
  };
  

  this._LoadDeletedData = function(response) {
    response.forEach(function(serverRow) {
      const rowIndx = serverRow['dt_index'];
      const $row = this.$table.row(rowIndx);
      if (!serverRow['modified_ok']) {
        this.addErrorMessage($row, serverRow['error']);
      }
    }, this);
  }

  /*
  PUBLIC METHODS FOR MANAGING A TABLE.
  */

  this.removeDeletedData = function(dataHasErrors) {

    const that = this;

    if (dataHasErrors) {
        // If there are errors, we need to iterate over all of the rows in the
        // request to make sure we don't accidentally remove one accidentally
        
        const successfullyDeletedRows = [];  
        this.$table.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
          const $deletedRow = this.nodes().to$();
          if ($deletedRow.hasClass('deleted-row') && (!$deletedRow.hasClass('database-error'))) {
              successfullyDeletedRows.push(this.index());
            }
          });

          // Ensures no indicies get moved (as its deleted in descending order)
          // otherwise "random" rows will get deleted for seemingly
          // no purpose.
          successfullyDeletedRows.reverse();
          that.$table.rows(successfullyDeletedRows).remove().draw();
      } else {
          // Otherwise we can delete all rows that have class deleted row
          // because they were all deleted successfully
          that.$table.rows('.deleted-row').remove().draw();
      }
  }

  this.addEmptyRow = function() {
    // Assigns a new object, otherwise whatever the user
    // writes to the new row becomes the default.
    const addedRow = this.$table.row
      .add(Object.assign({}, this.newRowDefaults))
      .draw();
    this.applyEditing();
    this._applyReadOnlyStyle();
    this.tracker.createdIndex(addedRow.index());
  }

  this.rowClickHandler = function() {
    
    that = this;
    
    $('#' + that.tableId + ' tbody').on('click', 'tr td', function() {
      // First apply/remove the style of selected row.  
      const rowIndx = that.$table.cell(this).index().row;
      const colIndx = that.$table.cell(this).index().column;
      if (!that.editableColumnDefs.editableBooleanColumns.includes(colIndx)) {
        const $tblNodes = that.$table.row(rowIndx).nodes().to$();
        if ($tblNodes.hasClass('selected')) {
          $tblNodes.removeClass('selected');
        } else {
          that.$table.row('.selected').nodes().to$().removeClass('selected');
          $tblNodes.addClass('selected');
        }  
      }
      

      
      // If this column isn't a boolean column, return false
      // as we don't need to manually change state

      if (!that.editableColumnDefs.editableBooleanColumns.includes(colIndx)) {
        return false;
      }

      
      const targetCheckedStatus = !that._isChecked(rowIndx, colIndx);
      console.log('row ' + rowIndx + ' clicked.');

      that._toChecked(rowIndx, colIndx, targetCheckedStatus);
      that.tracker.updatedIndex(rowIndx);
    });
  }

  this.applyEditing = function () {
    const editableColumns = this.editableColumnDefs.editableColumns;
    const that = this;
    for (var i = 0; i < editableColumns.length; i++) {
    
      const currentColumn = that.$table.column(editableColumns[i]);
      if (!currentColumn.nodes().to$().hasClass("editbox")) {
        currentColumn.nodes().to$().removeClass("editbox");
      }

      currentColumn.nodes().to$().addClass("editbox");

      that._tabToNextEditable(i);


    // Allows for the actual inline editing to be done.
    // Also unsure if I can use this here or scope changes. 
    // using "that" to be safe. Preliminary testing shows 
    // this is okay, but unsure about all scenarios.
    // Going to continue using that to avoid weird scoping issues.
    $(that.$table.column(editableColumns[i]).nodes()).editable( function (value, settings) {
      return value;
    }, {
      // default event to trigger editing is single click.
      // changed to double click because users will struggle to 
      // select rows if you need to click veeeery carefully in 
      // the part of the cell the event doesn't fire from.
      "event": "dblclick",
      "callback": function(newValue, y) {
        // Instead of directly pushing each change to the database
        // the data goes to this callback function instead.
        const oldValue = that.$table.cell(this).data();

        // TO DO
        // CONSIDER IMPLEMENTING AN INDEX TRACKING CHECK TO SEE IF
        // WHAT THEY'RE CHANGING IT TO IS DIFFERENT THAN WHAT 
        // THE SERVER ORIGINALL SENT.
        // FOR EXAMPLE, IF IT CHANGES FROM A TO B TO A AGAIN,
        // IT'LL STILL FIRE A REQUEST, BUT WE DON'T WANT IT
        // TO.

        // Ensures that we don't begin tracking a value if 
        // the user doesn't actually change it.
        if (oldValue != newValue){

          const updatedIndex = that.$table.row(this).index();
          that.$table.cell(this).data(newValue).draw();

          // Tracks the recently edited cell's row.
          that.tracker.updatedIndex(updatedIndex);
        }
      }
    });
    }
  }
  
  this.getData = function(indexes) {
    // If there aren't any indexes, returns null for a falsy comparison
    // when deciding to send a request.
    if (indexes.length == 0) {
      return null;
    }

    const requestData = [];

    indexes.forEach(function(indx) {
      // Need to assign the row data to a blank object
      // or else reading and transforming the data becomes a 
      // destructive process and you can only read once.
      const tableData = Object.assign({}, this.$table.row(indx).data());
      const rawData = this._convertRowToTimestamp(tableData);
      rawData['dt_index'] = indx;

      if (this.editableColumnDefs.booleanColumns.length == 0) {
        requestData.push(rawData);
        return;
      } else {
        this.editableColumnDefs.booleanColumns.forEach(function(boolCol) {
          const cellIsChecked = this._isChecked(indx, boolCol);
          rawData[this.indexToName[boolCol]] = cellIsChecked;
        }, this);
      }
      requestData.push(rawData);
    }, this);
    return requestData;
  };

  this.initialDataLoad = function (data) {
    // Load function for the initial request. Does not expect
    // the server data to have the dt_index variable. Deletes all data
    // in the table before reloading new data.
    // NOTE
    // this will need to be rewritten if we expect columns to change
    // as well as rows instead of just rows. (if table becomes drag and droppable)

    this.$table.clear();

    const dataOut = [];

    for (var i = 0; i < data.length; i++) {
      const currentRow = this._convertRowToLocal(data[i]);
      dataOut.push(currentRow);
    }

    this.$table.rows.add(dataOut).draw();
    this.applyEditing();
    this._applyReadOnlyStyle();
  };

  this.addErrorMessage = function (row, errorMessage) {
    const hasDatabaseError = $(row.node()).hasClass('database-error');
    
    if (!hasDatabaseError) {
      // FRUSTRATING
      // looks like datatables internally won't let your custom class
      // overwrite the background color property
      // so I'm brute forcing it over theirs.
      // This is hardcoded here and in the removeErrorMessage
      // function. I don't care enough to fix it.
      $(row.node()).addClass('database-error');
      $(row.node()).css("background-color", "#FA8072");
      $(row.node()).attr('title', errorMessage);
      //$(row.node()).setAttribute('title', errorMessage);
    }
  }

  this.removeErrorMessage = function (row) {
    const hasDatabaseError = $(row.node()).hasClass('database-error');
    if (hasDatabaseError) {
      $(row.node()).removeClass('database-error');
      $(row.node()).css("background-color", "");
      $(row.node()).attr('title', "");
    }
  }

  this.serverDataLoad = function({ serverData, requestMethod }) {
    
    if (requestMethod.toLowerCase() == 'delete') {
      this._LoadDeletedData(serverData);
    } else {
      this._loadUpdatedData(serverData);
    }
    this._applyReadOnlyStyle();
  }

  // Had to declare the private member first, then call it.
  
  this.$table = this._buildDataTable({ tableManager: this});
  this._applyReadOnlyStyle();
  this.rowClickHandler();
}