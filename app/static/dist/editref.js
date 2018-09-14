// This file contains everything specific to making an editref work.
// editabletable.js contains the actual TableManager class, which
// does a lot of the heavy lifting, but this is the adaptation of
// that class for an edit ref.
// It was seperated out so multiple tables can be called on a 
// bigger web page (think stylemaster) without changing
// how it interacts with the edit references.

function editrefCreatePutPromise({ url, updatedData }) {
  return $.ajax({
    url: url,
    method: "PUT",
    dataType: "json",
    data: JSON.stringify(updatedData),
    headers: {
      "content-type": "application/json"
    }
  });
}

function editrefCreatePostPromise({ url, createdData }) {
  return $.ajax({
    url: url,
    method: "POST",
    dataType: "json",
    data: JSON.stringify(createdData),
    headers: {
      "content-type": "application/json"
    }
  });
}

function editrefCreateDeletePromise({ url, deletedData }) {
  return $.ajax({
    url: url,
    method: "DELETE",
    dataType: "json",
    data: JSON.stringify(deletedData),
    headers: {
      "content-type": "application/json"
    }
  });
}

function editrefSendRequest({ editrefManager, url, updatedData, createdData, deletedData}) {
  // Creates promises for each request type, then makes sure to update the table & div at the top
  // of the page when all requests are successful or one (or more) request had an error.

  const requestErrors = [];

  var putPromise;
  var postPromise;
  var deletePromise;
  // Creating a dummy "flag" for when a promise is empty (don't need to be sending anything).
  const noDataFlag = {};

  if (updatedData) {
    putPromise = editrefCreatePutPromise({ url, updatedData });
  } else {
    putPromise = Promise.resolve(noDataFlag);
  }

  if (createdData) {
    postPromise = editrefCreatePostPromise({ url, createdData });
  } else {
    postPromise = Promise.resolve(noDataFlag);
  }

  if (deletedData) {
    deletePromise = editrefCreateDeletePromise({ url, deletedData });
  } else {
    deletePromise = Promise.resolve(noDataFlag);
  }

  $.when(putPromise, postPromise, deletePromise).then(function(updatedResponse, postResponse, deleteResponse) {
    // console.log('from $.when, updatedResponse is ' + JSON.stringify(updatedResponse));
    // console.log('from $.when[0] is ' + JSON.stringify(updatedResponse[0]));

    

    if (Object.keys(updatedResponse).length > 0) {
      editrefManager.serverDataLoad({ serverData: updatedResponse[0].data, requestMethod: "PUT"});
      requestErrors.push(updatedResponse[0].request_had_errors);
    }
    
    
    if (Object.keys(postResponse).length > 0) {
      editrefManager.serverDataLoad({ serverData: postResponse[0].data, requestMethod: "POST" });
      requestErrors.push(postResponse[0].request_had_errors);
    }

    if (Object.keys(deleteResponse).length > 0) {
      editrefManager.serverDataLoad({ serverData: deleteResponse[0].data, requestMethod: "DELETE"});
      requestErrors.push(deleteResponse[0].request_had_errors);
    }
    const requestSuccessful = (requestErrors.filter(reqStatus => reqStatus !== false).length === 0);
    // Deletes any rows that were sent to be deleted. This function should get called
    // regardless of whether there is deletedData because a user can create a row,
    // then delete it, and this function will need to delete that from the screen.
    editrefManager.removeDeletedData(requestErrors[requestErrors.length - 1]);

    // Only need to be called once per save button click as it resets state of 
    // the editref.
    editrefManager.requestManager.requestSuccessful = requestSuccessful;
    
    editrefManager.requestManager.showDivs().showErrorsOption();
    editrefManager.tracker = new IndexChangeTracker();

  });
    
}



// TO DO
// CREATE A CLASS OUT OF COLUMNS

function defineEditableColumns(columns) {

  const editableColumnDefs = {};
  editableColumnDefs.allEditableColumns = [];
  editableColumnDefs.allReadOnlyColumns = [];
  editableColumnDefs.editableBooleanColumns = [];
  editableColumnDefs.readOnlyBooleanColumns = [];
  editableColumnDefs.editableColumns = [];
  editableColumnDefs.timestamps = [];
  editableColumnDefs.booleanColumns = [];

  for (var i = 0; i < columns.length; i++) {
    let currentColumn = columns[i];
    let defaultValue = currentColumn['defaultContent'];

    const isBool = currentColumn.dtype === 'bool';
    const isEditable = currentColumn.editable;
    const isTimestamp = currentColumn.dtype === 'timestamp';

    if (isTimestamp) {
    	editableColumnDefs.timestamps.push(i);
    }

    if (isEditable) {
      editableColumnDefs.allEditableColumns.push(i);
    } else {
      editableColumnDefs.allReadOnlyColumns.push(i);
    }

    if (isBool) {
      editableColumnDefs.booleanColumns.push(i);
    }

    if (isBool && isEditable) {
      editableColumnDefs.editableBooleanColumns.push(i);
      continue;
    }

    if (isBool && !isEditable) {
      editableColumnDefs.readOnlyBooleanColumns.push(i);
      continue;
    }

    if (!isBool && isEditable) {
      editableColumnDefs.editableColumns.push(i);
      continue;
    }

  }
  return editableColumnDefs;
}
