### draggable-table.js

This is a helper method to make a table draggable by modifying the row attributes and drag and drop event handlers. 

#### Usage
Currently the assumption is that you already have an empty table element in your DOM and you will fill the table rows dynamically. 

First you initialize the draggable-table instance:
```js
var table = document.querySelector('#myTable');
var $_table = $_DT(table);
```

You can also set header names as optional parameters:
```js
var $table = $_DT(table, {
    headers: ['One', 'Two', 'Three', 'Four']
});
```


Use the ```appendRow()``` method to add rows to the table. this library keeps track of the number of columns added to the table and sets a _list-index_ attribute to keep track of the position of each column. So please make sure you don't override this attribute:
```
var tr = fnRowCreator(); // your custom row creation method
$_table.appendRow(tr);
```
You can also override style definitions in the ```draggable-table.css``` file with the options parameter.
```js
var options = {
    style: {
        onselected: 'selected',
        ondragstart: 'dragged',
        ondraggedover: 'drag-over',
        ondraggedoverfrombottom: 'bottom-up'
    }
}
```
* onselected: the style class to be applied on the row clicked. the previous clicked row will lose this class definition.
* ondragstart: the style class to be applied on the row being dragged. It is removed once the drag is over.
* ondraggedover: the style to be applied on the row the dragged row is over. it is removed when on the drag exit.
* ondraggedoverfrombottom: this style class is added in addition to ```ondraggedover``` when the dragged row is originally below this row. removed on drag exit.


Finally, you can listen to drag actions like this:
```
$_table.on('moved', function (obj) {
    'row with id' + obj.id + ' moved to index ' + obj.index + '.';
});
```

also, check the ```index.html``` and ```js/script.js``` file for a working example. 