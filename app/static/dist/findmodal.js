

// Requires bootstrap, popperjs, 

function FindModalTable($findTable, searchableColumns) {

	this.$findTable = $findTable,
	this.searchableColumns = searchableColumns,

}

function SearchColumn(name, alias, operators, dtype) {

	this.name = name,
	this.alias = alias,
	this.operators = operators,
	this.dtype = dtype
	
}
