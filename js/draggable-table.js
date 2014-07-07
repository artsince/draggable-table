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

    // method for ondragstart event
    var _fnDragStart = function (ev) {
        ev.dataTransfer.setData("Text", ev.target.id);

        var transferredRow = document.getElementById(ev.target.id);
        transferredRow.classList.add('dragged');
    };

    // method for ondragleave event
    var _fnDragLeave = function (ev) {
        ev.preventDefault();

        if(ev.target.parentNode.id == ev.dataTransfer.getData("Text")) {
            return;
        }

        var transferredRow = document.getElementById(ev.dataTransfer.getData('Text'));

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

        if(ev.target.parentNode.id == ev.dataTransfer.getData("Text")) {
            return;
        }

        var draggedItem = document.getElementById(ev.dataTransfer.getData('Text'));

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
        
        var dataId = ev.dataTransfer.getData("Text");
        var transferredRow = document.getElementById(dataId);

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
                    id: dataId,
                    index: parseInt(transferredRow.getAttribute('list-index'), 10)
                });
            }
        }
    };

    // method for ondragend event
    var _fnDragEnd = function (ev) {
        var transferredRow = document.getElementById(ev.target.id);
        transferredRow.classList.remove('dragged');
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

        _tbl.appendChild(tr);
    };

    return {
        appendRow: _fnAppendRow,
        on: _fnAddListener
    };
};