
// Trying to build the "export" button... unsuccessfully.
const exportStrip = function(str) {
	if (typeof str !== 'string') {
		return str;
	}

	// Removing a bunch of garbage, starting w/ script tags
	// Lets hope that nasty expression works, I copypasta'd it.
	str = str.replace( /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

	// removing html
	str = str.replace( /<[^>]*>/g, '' );

	// removes trailing spaces	
	str = str.replace( /^\s+|\s+$/g, '' );

	// removes line breaks	
	str = str.replace( /\n/g, ' ' );

	return str;
}

const _exportData = function ({$table, columns}) {

	// Everything in this function, contrary to the rest of the 
	// table stuff I've built, uses index mappings instead
	// of names.

	// I saw somewhere that this might change depending on os
	// ... or maybe I'm remembering wrong.
	const newLine = '\n'

	// Going to be appending the data to this.
	const body = [];
	
	// TO DO
	// DETERMINE IF THIS IS NECESSARY IF WE'RE TRYING TO EXPORT
	// THE ENTIRE TABLE
	const rowIndexes = $table.rows().indexes().toArray();

	// Gets the numbers of rows in the table. If there aren't any,
	// fails the export process.
	const rowCount = $table.rows().count();
	if (!rowCount) {
		return false;
	}
}


function filterTableByClass($table, className) {
	// Helper method that will filter a table based on the class
	// string provided in the function call.
	// I created the helper function instead of writing a jquery plugin
	// for datatables as this is much simpler, even though the
	// performance will be worse.

	const rowsNotHavingClass = [];

	$table.rows().every(function(rowIndx, tableLoop, rowLoop) {
		const hasDesiredClass = this.nodes().to$().hasClass(className);
		
		if (!hasDesiredClass) {
			rowsNotHavingClass.push(rowIndx);
		}
	});

	$table.rows(rowsNotHavingClass).remove().draw();
}


function RequestManager($divSuccess, $divWarning, $showErrorsDropdownItem) {
	/*
	Built and used for editrefs so that other screens could also use this.
	If I were to build an order screen, this could still be used at the top level to
	show whether the write to the database was successful.
	*/

	this.$divSuccess = $divSuccess;
	this.$divWarning = $divWarning;
	this.$showErrorsDropdownItem = $showErrorsDropdownItem;
	this.requestSuccessful = null;

	this.showErrorsOption = function() {

		console.log('this.$showErrorsDropdownItem hasClass is ' + this.$showErrorsDropdownItem.hasClass('disabled'));

		// request is successful, so we need to disable the user from clicking the option
		if (!this.requestSuccessful) {
			this.$showErrorsDropdownItem.removeClass('disabled');
			this.$showErrorsDropdownItem.removeClass('noclick');
		} else {
			this.$showErrorsDropdownItem.addClass('disabled');
			this.$showErrorsDropdownItem.addClass('noclick');
		}

		return this;

		// request had errors, so we need to allow the user to click the option
		
	}
	
	this.showDivs = function() {
		// Handles toggling the divs at the top of the 
		// screen based on the status held by this object.

		

		if (this.requestSuccessful) {
			this.$divWarning.hide();
			this.$divSuccess.show();
		} else {
			this.$divSuccess.hide();
			this.$divWarning.show();
		}
		return this;
	}
}