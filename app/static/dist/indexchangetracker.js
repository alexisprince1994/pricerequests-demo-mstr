// Index Change Tracker is a class that keeps track of edits made to a 
// table. 

function IndexChangeTracker() {
	this.createdIndexes = [];
	this.updatedIndexes = [];
	this.deletedIndexes = [];
	this.changedIndexes = {
		'created': false,
		'updated': false,
		'deleted': false,
	};

	// Provides an alternate way of accessing the indexes
	// managed by this class.
	this.indexes = {
		'created': this.createdIndexes,
		'updated': this.updatedIndexes,
		'deleted': this.deletedIndexes
	};


	this.createdIndex = function (index) {
		// This is the result of someone hitting the new row button.
		// Much more straightfoward than the rest of them.
		this.createdIndexes.push(index);
		this.changedIndexes.created = true;
	}

	this.updatedIndex = function (index) {
		// Checks to see if this is being handled by the new indexes
		// If so, doesn't need to be a part of two requests to server.
		if (this.createdIndexes.includes(index)) {
			return;
		}

		// No need to send it twice. Its already being tracked.
		if (this.updatedIndexes.includes(index)) {
			return;
		} else {
			this.updatedIndexes.push(index);
			this.changedIndexes.updated = true;
		}
	}

	this.deletedIndex = function(index, $table) {
		

		if (this.updatedIndexes.includes(index)) {
			this.updatedIndexes.splice(this.updatedIndexes.indexOf(index), 1);
		}

      	// Deleting a row twice shouldn't add the index twice.
      	if (!this.deletedIndexes.includes(index)) {
        	this.deletedIndexes.push(index);
        	this.changedIndexes.deleted = true;
		}

		if (this.createdIndexes.includes(index)) {
			this.createdIndexes.splice(this.createdIndexes.indexOf(index), 1);
		}

    $table.row(index).nodes().to$().removeClass('selected');
    $table.row(index).nodes().to$().addClass('deleted-row');

	}
}