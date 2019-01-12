document.onload = function () {
    window.hotkeys = shortcuts({
        ESC: handleEsc,
        'CMD+V': handlePaste,
        'CMD+A': handleSelectAll,
        ENTER: handleEnter,
        'CMD+ENTER': handleEnter, // auto resolve to CTRL+ENTER on window
        'ALT+ENTER': handleEnter,
        'SHIFT+ENTER': handleEnter,
        UP: handleArrowUp,
        TAB: handleTab,
        ALL: handleAllInput
    });
}

function handleEsc() {
    // some escape press handler
    window.hotkeys.destroy(); // hotkeys layer destructor!
}

function handleSelectAll() {
    // some other handler
}

function handleEnter() {
    // some other handler
    alert('it works!'); // press enter and see 'it works!' in alert window
}

function handleArrowUp() {
    // some other handler
}

function handleTab() {
    // some other handler
}

function handleAllInput() {
    // some other handler
}
