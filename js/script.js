/*
 * method to automatically create rows
 */
var createRow = function (colSize, index) {
    var tr = document.createElement('tr');
    var i;
    var td;

    tr.id = 'r' + index;
    tr.setAttribute('list-index', index);

    for(i = 0; i < colSize; i += 1) {
        td = document.createElement('td');
        
        td.innerHTML = Math.floor(Math.random() * 1000);
        tr.appendChild(td);
    }

    return tr;
};

var rowSize = 20, columnSize = 20;
var table = document.querySelector('table');
var $table = $_DT(table, {
    headers: new Array(rowSize).join().split(',').map(function (item, index) { return ++index; })
});

for(var i = 0; i < rowSize; i += 1) {
    $table.appendRow(createRow(columnSize, i));
}


$table.on('moved', function (obj) {
    var logDiv = document.getElementById('logs');
    var span = document.createElement('span');
    span.innerHTML = 'row with id <strong>' + obj.id + '</strong> moved to index <strong>' + obj.index + '</strong>.';
    logDiv.appendChild(span);
});