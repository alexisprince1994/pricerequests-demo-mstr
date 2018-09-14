// TO DO
// SIMPLIFY THE ENTITIES HERE


function FindColumn(name, dtype, operators) {
		this.name = name;
		this.dtype = dtype;
		this.operators = operators;
	}

function findInputManager($inputValue, $boolInput) {
	// Used to manage state on the Search Value
	// input box. This puts different options
	// based on the columns selected by the user.

	//$inputValue = jquery selector for the text input box
	//$boolInput = jquery selector for the dropdown menu
	//	that contains true and false for options of bool cols.
	this.$inputValue = $inputValue;
	this.$boolInput = $boolInput;
	this.$boolInput.hide();

	// Builds the initial boolean input options (only true/false available.)
	[true, false].forEach(key => this.$boolInput.append($("<option></option>").attr("value", key).text(key)));


	this.disableTextBox = function() {
		// Created a method to do this in case any logic needs
		// to be placed here.
		this.$inputValue.prop('disabled', true);
	}

	this.enableTextBox = function() {
		// Created a method to do this in case any logic needs
		// to be placed here.
		this.$inputValue.prop('disabled', false);
	}

	this.showTextBox = function() {
		this.$boolInput.hide();
		this.$inputValue.show();
	}

	this.showBoolInput = function() {
		this.$inputValue.hide();
		this.$boolInput.show();
	}
}

function ColumnManager($columnDropdown, columnMappings, $operatorDropdown, operators, findColumnOptions, valueManager) {
	// the jquery selector for the columns that should be searchable
	this.$columnDropdown = $columnDropdown;
	// the list of columns and their dtype mappings
	this.columnMappings = columnMappings;
	// The jquery selector for the operator dropdown
	// with the <option></option> tags in them.
	this.$operatorDropdown = $operatorDropdown;
	// The object that holds {'bool': [true, false], 'other': [...]}
	this.operators = operators;
	this.valueManager = valueManager;
	this.findColumnOptions = findColumnOptions;

	// Declaring attributes that are going to be used later.
	this.column = null;
	this.currentOperator = null;
	this.currentOperators = null;

	this._toggleInputDisable = function () {
		
		if (this.column.dtype === 'bool') {
			this.valueManager.showBoolInput();
		} else {
			this.valueManager.showTextBox();
			if (this.currentOperator === 'Is Null' || this.currentOperator === 'Is Not Null') {
				this.valueManager.disableTextBox();
			} else {
				this.valueManager.enableTextBox();
			}
		}

	}

	// Writing to the DOM is expensive, bail early if possible.
	this._changeOperators = function() {
		if (this.currentOperators === this.operators[this.column.dtype]) {
			return false;
		} else {
			this.currentOperators = this.operators[this.column.dtype];
			this.column.operators = this.operators[this.column.dtype];
			this.$operatorDropdown.empty();
			
			
			// Builds the correct operator options for the datatype of the column
			// selected by the user.
			Object.entries(this.column.operators).forEach(([key, value]) => this.$operatorDropdown.append($("<option></option>").attr("value", key).text(value)));
		}
	};

	this.operatorChangeHandler = function() {
		// Confirms whether or not the user should be allowed to input
		// data into the "data" field based on the operator. For example,
		// the "is null" option will not require a data option.

		this.currentOperator = this.column.operators[this.$operatorDropdown.val()];
		this._toggleInputDisable();
	}

	this.columnChangeHandler = function() {
		// Confirms the correct operators are displayed when a user selects
		// a different column from the column drop down.
		const findName = this.findColumnOptions[this.$columnDropdown.val()];
		const findDtype = this.columnMappings[findName];
		const findOperators = this.operators[findDtype];

		this.column = new FindColumn(findName, findDtype, findOperators);
		console.log('findName is ' + findName);
		console.log('findDtype is ' + findDtype);
		console.log('findOperators is ' + JSON.stringify(findOperators));
		console.log('currentOperators is ' + JSON.stringify(this.currentOperator));
		this._changeOperators();
		this._toggleInputDisable();
	}
}

function FindDataManager(columnManager, $findTable, findButtons) {
	// columnManager is an instance of ColumnManager
	// $findTable is the actual datatable instance of the table
	// 	in the find screen.
	// findButtons is an object of all buttons used on the find screen.
	this.$findFindButton = findButtons.$findFindButton;
	this.$findTable = $findTable;
	this.columnManager = columnManager;

	this.buildGetParams = function() {
		const findQueryParams = [];
		const that = this;
		if (this.$findTable.data().count()) {
			that.$findTable.rows().every(function(rowIndx, tableLoop, rowLoop) {
				const findCurrentData = that.$findTable.row(rowIndx).data();
				const findQueryString = findCurrentData.column + ";" + 
					findCurrentData.operator + ";" + 
					findCurrentData.value + ";"
					;
				findQueryParams.push(findQueryString)
			});
		} else {
			// This means there are no rows in the table, meaning grab the entire table.
			findQueryParams.push('all');
		}
		return findQueryParams;
	}
}

function FindRow(column, operator, value) {
	this.column = column;
	this.operator = operator;
	this.value = value;
}

function buildGetParams($findModalTable) {

	// Builds the query string to append to the get request
	// If they don't specify a filter, we send back
	// an empty query string with filter as an argument
	// That way, we don't load the entire table on the
	// initial get request of the page.
	
	// Format of the query string is 
	// column;operator;value
	
	const findQueryParams = [];


	if ($findModalTable.data().count()) {
		
		$findModalTable.rows().every(function (rowIndx, tableLoop, rowLoop) {
			
			const findCurrentData = $findModalTable.row(rowIndx).data();
			const findCurrentColumn = findCurrentData.column;
			const findCurrentOperator = findCurrentData.operator;
			const findCurrentValue = findCurrentData.value;

			// Builds string of column;operator;value
			const findQueryString = findCurrentColumn + ";" +
				findCurrentOperator + ";" + 
				findCurrentValue
				;
			
			findQueryParams.push(findQueryString)

		});
	}

	return findQueryParams;	
}