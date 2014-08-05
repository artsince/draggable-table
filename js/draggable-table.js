/*
 * $_DT function takes a table HTML element as a parameter.
 * Adding rows to the the table with the <code>appendRow</code> method will turn these rows into
 * draggable elements. by calling <code>on('moved', callback)</code> method, you can listen to the row
 * drop events.
 *
 * this function uses css classes defined in the style.css file. Make sure you include that file, and
 * feel free to modify them to look better.
 */
var $_DT = function (table, options) {
    var _tbl = table;
    var _options = options || {};
    var _listeners = {};
    var _rowCount = 0;

    if(_options.headers) {
        (function () {
            var len = _options.headers.length, i,
                thead = document.createElement('thead'),
                tr = document.createElement('tr');


            // insert this header as the first child
            _tbl.insertBefore(thead, _tbl.firstChild);
            thead.appendChild(tr);

            for(i = 0; i < len; i += 1) {
                var th = document.createElement('th');
                th.innerHTML = _options.headers[i];
                tr.appendChild(th);
            }
        }());
    }

    /* generic event listener implementation, though practically
     * only 'moved' events are triggered
     */
    var _fnAddListener = function (event, callback) {
        if(!_listeners[event]) {
            _listeners[event] = [];
        }

        _listeners[event].push(callback);
    };

    /*
        due to some bug or security limitation I am not sure about, it seems like
        ex.dataTransfer.getData method does not return the data I set in drag start.
        To work around this issue, I am using the id in _dragged_id variable.
     */
    var _dragged_id = '';

    // method for ondragstart event
    var _fnDragStart = function (ev) {
        _dragged_id = ev.target.id;

        var transferredRow = document.getElementById(_dragged_id);
        transferredRow.classList.add('dragged');
    };

    // method for ondragleave event
    var _fnDragLeave = function (ev) {
        ev.preventDefault();

        if(ev.target.parentNode.id === _dragged_id) {
            return;
        }

        var transferredRow = document.getElementById(_dragged_id);

        if(ev.target.parentNode.classList.contains('drag-over')) {
            ev.target.parentNode.classList.remove('drag-over');

            if(parseInt(ev.target.parentNode.getAttribute('list-index'), 10) < parseInt(transferredRow.getAttribute('list-index'), 10)) {
                ev.target.parentNode.classList.remove('bottom-up');
            }
        }
    };

    // method for ondragover event
    var _fnDragOver = function (ev) {
        ev.preventDefault();

        if(ev.target.parentNode.id === _dragged_id) {
            return;
        }

        var draggedItem = document.getElementById(_dragged_id);

        if(!ev.target.parentNode.classList.contains('drag-over')) {
            ev.target.parentNode.classList.add('drag-over');

            if(parseInt(ev.target.parentNode.getAttribute('list-index'), 10) < parseInt(draggedItem.getAttribute('list-index'), 10)) {
                ev.target.parentNode.classList.add('bottom-up');
            }
        }

    };

    // method for ondrop event
    var _fnDrop = function (ev) {
        ev.preventDefault();
        
        var data_id = _dragged_id;
        var transferredRow = document.getElementById(data_id);

        var draggedIndex = parseInt(transferredRow.getAttribute('list-index'), 10);
        var droppedIndex = parseInt(ev.target.parentNode.getAttribute('list-index'), 10);

        if(draggedIndex < droppedIndex) {
            ev.target.parentNode.parentNode.insertBefore(transferredRow, ev.target.parentNode.nextSibling);
        }
        else {
            ev.target.parentNode.parentNode.insertBefore(transferredRow, ev.target.parentNode);
        }

        if(ev.target.parentNode.classList.contains('drag-over')) {
            ev.target.parentNode.classList.remove('drag-over');

            if(parseInt(ev.target.parentNode.getAttribute('list-index'), 10) < parseInt(transferredRow.getAttribute('list-index'), 10)) {
                ev.target.parentNode.classList.remove('bottom-up');
            }
        }

        // fix indices for each row after drop event
        _fnFixListIndices(transferredRow, ev.target.parentNode);

        // trigger onmove event callbacks
        if(_listeners.moved) {
            for(var i = 0; i < _listeners.moved.length; i += 1) {
                _listeners.moved[i].call(null, {
                    id: data_id,
                    index: parseInt(transferredRow.getAttribute('list-index'), 10)
                });
            }
        }
    };

    /* 
        method for ondragend event
        setting _dragged_id to empty, even though it is not really necessary
     */
    var _fnDragEnd = function (ev) {
        var transferredRow = document.getElementById(_dragged_id);
        transferredRow.classList.remove('dragged');
        _dragged_id = '';
    };

    /*
     * Each row has list-index attribute to suggest its place in the list to easily track
     * dragging up and down events. indices are updated after each drop event.
     */
    var _fnFixListIndices = function(draggedItem, droppedItem) {
        var draggedIndex = parseInt(draggedItem.getAttribute('list-index'), 10);
        var droppedIndex = parseInt(droppedItem.getAttribute('list-index'), 10);
        var sibling;

        // if you are dragging an item down the list
        if(draggedIndex < droppedIndex) {
            for(sibling = draggedItem.previousSibling; sibling && parseInt(sibling.getAttribute('list-index'), 10) > draggedIndex; sibling = sibling.previousSibling) {
                sibling.setAttribute('list-index', parseInt(sibling.getAttribute('list-index'), 10) - 1);
            }
        }
        else {
            // if you are dragging an item up the list
            for(sibling = droppedItem; sibling && parseInt(sibling.getAttribute('list-index'), 10) < draggedIndex; sibling = sibling.nextSibling) {
                sibling.setAttribute('list-index', parseInt(sibling.getAttribute('list-index'), 10) + 1);
            }
        }

        draggedItem.setAttribute('list-index', droppedIndex);
    };

    /*
     * method for onmousedown event. this method is used to highlight the selected row.
     */
    var _fnMouseDown = function (ev) {
        var prevSelected = document.querySelector('.selected');
        if(prevSelected) {
            prevSelected.classList.remove('selected');
        }

        this.classList.add('selected');
    };

    /*
     * private method to append a new row to the table and make the row draggable.
     */
    var _fnAppendRow = function (tr) {
        tr.setAttribute('draggable', true);

        tr.addEventListener('dragstart', _fnDragStart, false);
        tr.addEventListener('dragleave', _fnDragLeave, false);
        tr.addEventListener("dragover", _fnDragOver, false);
        tr.addEventListener('drop', _fnDrop, false);
        tr.addEventListener('dragend', _fnDragEnd, false);

        tr.addEventListener('mousedown', _fnMouseDown, false);

        if(!tr.getAttribute('list-index')) {
            tr.setAttribute('list-index', _rowCount++);
        }

        _tbl.appendChild(tr);
    };

    return {
        appendRow: _fnAppendRow,
        on: _fnAddListener
    };
};