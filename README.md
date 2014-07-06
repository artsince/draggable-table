### draggable-table.js

This is a helper method to make a table draggable by modifying the row attributes and drag and drop event handlers.

#### Usage

to initialize:
```
var table = document.querySelector('#myTable');
var $_table = $_DT(table);

```

to add rows to the table:
```
var tr = fnRowCreator(); // your custom row creation method
$_table.appendRow(tr);
```

to track drag results:
```
$_table.on('moved', function (obj) {
    'row with id' + obj.id + ' moved to index ' + obj.index + '.';
});
```

also, check the ```index.html``` and ```js/script.js``` file for a working example.