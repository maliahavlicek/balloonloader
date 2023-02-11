const main = document.querySelector('.main');

const colors = ['#eae4e9ff', '#fff1e6ff', '#fde2e4ff', '#fad2e1ff', '#e2ece9ff', '#bee1e6ff', '#f0efebff',
    '#dfe7fdff', '#cddafdff', '#dfd7fcff', '#f8b4c4ff', '#ffedc2ff', '#60fbd2ff', '#7cd5f3ff', '#8fdbf5ff', '#3dccc7ff'
];

let group_elements = [];
let MOVING_ELEMENT = '';
let startX, startY, previousY;
const flight_elements = document.querySelectorAll('.drop-targets');
let hovered_flight;
let lastY;
let currentY;
const touchSensitivity = 7; //touch sensitivity, I found between 4 and 7 to be good values.

/**
 * dragGroupStart: Handler called when dragging a "group" element begins
 *
 *  1. don't allow handler to trickle to a parent group
 *  2. add class to signify object is grabbed
 *  3. hide the original element to avoid user confusion
 *  4. set global for element that is being moved
 */
function dragGroupStart(e) {
    e.stopPropagation();
    this.classList.toggle('hold');
    setTimeout(() => (this.classList.toggle('hide')), 0);
    MOVING_ELEMENT = e;
}

/**
 * dragGroupEnd: Handler called when dragging a "group" element ends
 *
 *  1. don't allow handler to trickle to a parent group
 *  2. remove class for holding
 *  3. show moved element
 */
function dragGroupEnd(e) {
    e.stopPropagation();
    this.classList.toggle('hold');
    this.classList.toggle('hide');
}

/**
 * dragOverFlightElement: Handler called when dragging a group
 * over a flight Element
 *
 *  1. Prevent default to allow drop into flight element
 */
function dragOverFlightElement(e) {
    e.preventDefault();
}

/**
 * dragEnterFlightElement: Handler called when dragging a group
 * into a flight Element
 *
 *  1. Prevent default to allow drop into flight element
 *  2. add class of hovered to potential dropzone
 */
function dragEnterFlightElement(e) {
    e.preventDefault();
    this.classList.toggle('hovered');
}

/**
 * dragLeaveFlightElement: Handler called when dragging a group
 * into a flight Element
 *
 *  1. remove class of hovered to potential dropzone
 */
function dragLeaveFlightElement() {
    this.classList.toggle('hovered');
}

/**
 * groupElementTouchMove: Handler called when mobile devices
 * is moving a Group Element
 *
 *  1. prevent browser from continuing to process the touch event & prevent mouse
 *  event from being delivered
 *  2. only handle the 1 finger action as a dragging motion for group element
 *  3. Translate the x.y to stimulate moving element
 *  4. see if a valid dropzone is below object and toggle it's hovered class
 *  5. ? Should this function be debounced
 *
 *  basic touch process https://jh3y.medium.com/implementing-touch-support-in-javascript-b8e43f267a16
 */
function groupElementTouchMove(e) {
    e.preventDefault();
    //only 1 finger action detected
    if (e.targetTouches.length == 1) {


        let els = document.elementsFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        for (const el of els) {
            if (el.classList.contains('drop-targets')) {
                if (typeof hovered_flight == 'undefined') {
                    el.classList.add('hovered');
                    hovered_flight = el;
                }
                if (hovered_flight && hovered_flight != el) {
                    hovered_flight.classList.remove('hovered');
                    el.classList.add('hovered');
                    hovered_flight = el;
                }

            }
        }

        //get current y pos
        const progressX = startX - e.touches[0].clientX
        let progressY = startY - e.touches[0].clientY

        if(Math.abs(e.touches[0].clientY - lastY) > touchSensitivity ) {
            if (e.touches[0].clientY < startY) {
                window.scrollTo(e.touches[0].clientX, e.touches[0].clientY);
                console.log(`Touch ABOVE: touch.clientY: ${e.touches[0].clientY} startY: ${startY} window.pageYOffset: ${window.pageYOffset} window.scrollY ${window.scrollY} e.target.getBounding.top ${e.target.getBoundingClientRect().top}`)

            } else if (e.touches[0].clientY > startY) {
                window.scrollTo(e.touches[0].clientX, e.touches[0].clientY);
                console.log("Touch BELOW viewport!")
            }
            // need to figure out translation

        }

        const translationX =
            progressX > 0
                ? parseInt(-Math.abs(progressX))
                : parseInt(Math.abs(progressX))
        const translationY =
            progressY > 0
                ? parseInt(-Math.abs(progressY))
                : parseInt(Math.abs(progressY))

        MOVING_ELEMENT.style.setProperty('--translateX', translationX);
        MOVING_ELEMENT.style.setProperty('--translateY', translationY);


    }
}

/**
 * decoupleChild
 *
 * if element being moved is a person vs a group, we need to restructure the HTML
 * */
function decoupleChild(moved_elem) {

    if (moved_elem.classList.contains('person')) {
        const name = moved_elem.dataset.name;
        const weight = moved_elem.dataset.weight;
        const group_no = moved_elem.dataset.group_number;
        let new_element = `<div class="group group-${group_no} d-flex flex-column" draggable="true" data-group_number="${group_no}" style="--translateX:0; --translateY:0;" draggable="true" >` +
            `<div class="group-name" data-group-name="${name}">` +
            `<span class="count">1</span>` +
            `<span>-</span>` +
            `<span class="name">${name}</span>` +
            `</div>` +
            `<div class="d-flex flex-row">` +
            `<div class="weight group-weight">${weight}</div>` +
            `<div class="details d-block">` +
            `<div class="person group group-${group_no} d-flex flex-row" data-weight="${weight}" data-group_number="${group_no}" data-count="1" data-name="${name}" style="--translateX:0;--translateY:0;">` +
            `<div class="weight">${weight}</div>` +
            `</div></div></div></div>`;

        moved_elem.dataset.weight -= parseInt(weight);
        moved_elem.dataset.count--;
        moved_elem.classList.add('delete-me');


        return new_element

    } else return false;


}


/**
 * groupElementTouchEnd: Handler called when mobile device
 *  swipe to move Group Element Ends
 *
 *  1. prevent browser trickling up to parent group element
 *  2. remove translation from object being moved
 *  3. remove hovered effect from any drop zones
 *  4. remove special classes to allow a child group object to be seen
 *  5. append the moved group element to tne new dropzone object
 *  6. kick off flight calculation
 */
function groupElementTouchEnd(e) {
    e.stopPropagation();
    const finishingTouch = e.changedTouches[0];

    MOVING_ELEMENT.classList.remove('hold');
    MOVING_ELEMENT.style.setProperty('--translateX', '0');
    MOVING_ELEMENT.style.setProperty('--translateY', '0');
    MOVING_ELEMENT.style.removeProperty('z-index');

    const destination_element = hovered_flight;
    if (destination_element && destination_element.classList.contains('drop-targets')) {

        const new_elem = decoupleChild(MOVING_ELEMENT);
        if (new_elem) {
            destination_element.insertAdjacentHTML('beforeend', new_elem);
        } else {
            destination_element.append(MOVING_ELEMENT);
        }

        updateWeights();
        applyGroupHandlers();

    }
    try {
        hovered_flight.classList.remove('hovered');

        MOVING_ELEMENT.parentElement.parentElement.parentElement.style.removeProperty('z-index');
        MOVING_ELEMENT.parentElement.parentElement.parentElement.style.removeProperty('overflow');

    } catch {
        //do nothing timing issue might not realize hover is already off
    }
    hovered_flight = undefined;

}

/**
 * groupElementTouchStart: Handler called when mobile device
 *  touches a Group Element
 *
 *  1. prevent browser trickling up to parent group element
 *  2. pay attention to only the moving touch
 *  3. start adding translation to the element
 *  4. add hold class to element
 *  5. if it's a child override CSS so it's visible above parent & other objecst
 *  placed on DOM after it
 *  6. create the moving handler
 */
function groupElementTouchStart(e) {

    e.stopPropagation();
    const {touches} = e
    // only 1 finger touch is actionable
    if (touches && touches.length === 1) {
        const touch = touches[0]
        startX = touch.clientX;
        startY = touch.clientY;
        currentY = e.touches[0].clientY;
        lastY = currentY;
        MOVING_ELEMENT = e.currentTarget;
        MOVING_ELEMENT.classList.add('hold');

        MOVING_ELEMENT.style.setProperty('z-index', '200');

        if (MOVING_ELEMENT.parentElement.classList.contains('details')) {
            MOVING_ELEMENT.parentElement.parentElement.parentElement.style.setProperty('z-index', '200');
            MOVING_ELEMENT.parentElement.parentElement.parentElement.style.setProperty('overflow', 'visible');
        }
        MOVING_ELEMENT.removeEventListener('touchmove', groupElementTouchMove);
        MOVING_ELEMENT.removeEventListener('touchend', groupElementTouchEnd);
        MOVING_ELEMENT.addEventListener('touchmove', function (e) {
            e.preventDefault();
            groupElementTouchMove(e);
        }, {passive: false});
        MOVING_ELEMENT.addEventListener('touchend', groupElementTouchEnd);

    }
}

/**
 * dragDropIntoFlightElement: Handler called when mouse release
 * dragged group into Flight Element
 *
 *  1. toggle the flight element's hovered state
 *  2. append the moved element to the destination drop zone
 *  3. kick off UX update of counts & weights
 */
function dragDropIntoFlightElement(e) {
    this.classList.toggle('hovered');
    const new_elem = decoupleChild(MOVING_ELEMENT.target);
    if (new_elem) {
        this.insertAdjacentHTML('beforeend', new_elem);
    } else this.append(MOVING_ELEMENT.target);
    updateWeights();
    applyGroupHandlers();

}

/**
 * updateWeights: called after DOM manipulation of a group is done
 * AKA drag & drop or touch move
 *
 *  1. hides empty parent groups
 *  2. recalculates parent group weights
 *  3. updates the parent group counts
 *  4. recalculates left and right counts & weights for each flight
 *  5. updates flight totals
 *  6. updates grand totals
 *
 */
function updateWeights() {

    const groups_parents = document.querySelectorAll('.group .details');

    for (const group_element of groups_parents) {
        // check if group  is empty and hide it
        if (group_element.childElementCount === 0) {
            group_element.parentElement.classList.add('delete-me');
        }
        //remove empty groups
        for (el of document.querySelectorAll('.delete-me')) {
            el.remove();
        }
        // don't allow child to be dragged if group count is 1
        if (group_element.childElementCount === 1) {
            for (el of group_element.querySelectorAll('.person')) {
                el.setAttribute('draggable', false);
            }
        }

        // update count in data and display
        group_element.dataset.count = group_element.childElementCount.toString();
        group_element.parentElement.parentElement.querySelector('span.count').innerHTML = group_element.childElementCount.toString();

        // recalculate group weight
        let group_total = 0;
        for (const person of group_element.querySelectorAll('.person')) {
            group_total += parseInt(person.dataset.weight);
        }
        group_element.parentElement.querySelector('.group-weight').innerHTML = group_total.toString();
        group_element.parentElement.dataset.weight = group_total.toString();
    }

    // update left-right weights & counts
    for (const flight of flight_elements) {
        if (!flight.classList.contains('names')) {

            let total = 0;
            let count = 0;
            for (const person of flight.querySelectorAll('.person')) {
                total += parseInt(person.dataset.weight);
                count++;
            }
            let weight_elm = document.querySelector(flight.dataset.weight_elm);
            weight_elm.innerHTML = total.toString();
            flight.dataset.weight = total.toString();
            let count_elm = document.querySelector(flight.dataset.count_elm);
            count_elm.innerHTML = count.toString();
            flight.dataset.count = count.toString();
        }

    }

    // update differences
    for (const elem of document.querySelectorAll('.diff-weight')) {
        elem.innerHTML = '';
    }
    ;
    const f1_diff = parseInt(document.querySelector('#f1-left').dataset.weight) - parseInt(document.querySelector('#f1-right').dataset.weight);
    const f2_diff = parseInt(document.querySelector('#f2-left').dataset.weight) - parseInt(document.querySelector('#f2-right').dataset.weight);
    if (f1_diff > 0) {
        document.querySelector('#flight-1 .left.diff-weight').innerHTML = `(${f1_diff})`;
    } else if (f1_diff < 0) {
        document.querySelector('#flight-1 .right.diff-weight').innerHTML = `(${Math.abs(f1_diff)})`;
    }
    if (f2_diff > 0) {
        document.querySelector('#flight-2 .left.diff-weight').innerHTML = `(${f2_diff})`;
    } else if (f2_diff < 0) {
        document.querySelector('#flight-2 .right.diff-weight').innerHTML = `(${Math.abs(f2_diff)})`;
    }


    // update total weights & counts
    let grand_total = 0;
    let grand_count = 0;
    for (const flight of document.querySelectorAll('.flight')) {
        let total = 0;
        let count = 0;
        for (const side of flight.querySelectorAll('.drop-targets')) {
            total += parseInt(side.dataset.weight);
            count += parseInt(side.dataset.count);
        }
        flight.querySelector('.total-weight').innerHTML = total.toString();
        flight.querySelector('.total-count').innerHTML = count.toString();
        grand_total += total;
        grand_count += count;

    }

    //update grand totals
    document.querySelector('.grand-total-weight').innerHTML = grand_total.toString();
    document.querySelector('.grand-total-count').innerHTML = grand_count.toString();


}


/**
 * applyPatronDropZoneHandlers: sets handlers to the drop zones for the patrons & flight
 * sides
 *
 */
function applyPatronDropZoneHandlers() {

    for (const flight_element of flight_elements) {
        flight_element.addEventListener('dragover', dragOverFlightElement);
        flight_element.addEventListener('dragenter', dragEnterFlightElement);
        flight_element.addEventListener('dragleave', dragLeaveFlightElement);
        flight_element.addEventListener('drop', dragDropIntoFlightElement);
    }
}

/**
 * applyGroupHandlers: apply handlers for groups
 *
 *  1. remove any existing handlers
 *  2. reset for drag star & dragend
 *  3. reset touchstart
 */
function applyGroupHandlers() {
    group_elements = document.querySelectorAll('.group');


    //drop any existing group/name listeners
    for (const group_element of group_elements) {
        // clean up any moving styles
        try {
            group_element.style.removeProperty('z-index');
            group_element.style.removeProperty('overflow');
        } catch {
            //do nothing, just don't error
        }
        group_element.removeEventListener('dragstart', dragGroupStart);
        group_element.removeEventListener('dragend', dragGroupEnd);
        group_element.removeEventListener('touchstart', groupElementTouchStart);
    }

    group_elements = document.querySelectorAll('.group[draggable="true"]');
    // apply  group/name listeners
    for (const group_element of group_elements) {
        group_element.addEventListener('dragstart', dragGroupStart);
        group_element.addEventListener('dragend', dragGroupEnd);
        group_element.addEventListener('touchstart', groupElementTouchStart);
    }
}

async function disableOptimize(bool) {
    console.log("disable", bool);
    for (const el of document.getElementsByClassName("optimize")) {
        console.log("disabling", el);
        el.disabled = bool;
    }
    await new Promise(r => setTimeout(r, 100));
}

async function optimizeClick(num) {
    await disableOptimize(true);
    const pieces = [];
    const vals = [];
    for (const el of document.querySelectorAll(".group-weight")) {
        /* ignore those dragged into the trash/ignore target */
        if (el.parentElement.parentElement.parentElement.id !== 'ignore') {
            pieces.push(el.parentElement.parentElement);
            vals.push(Number(el.innerText));
        }
    }
    let targets = ["f1-left", "f1-right"];
    if (num === 2) targets.push("f2-left", "f2-right");
    targets = targets.map(x => document.getElementById(x));
    // const el = document.querySelectorAll(".group-weight")[0];
    // document.querySelector("#f1-left").append(el.parentElement.parentElement);
    const opts = {
        balance: Number(document.querySelector("[name=balance]").value),
        exponent: Number(document.querySelector("[name=exponent]").value),
    };
    optimize(targets, pieces, vals, opts);
    updateWeights();
    disableOptimize(false);
}


/**
 * ReadyFunction: once DOM is complete
 *
 *  1. apply import handler (still needs to be hooked up to build DOM)
 *  2. set handlers for drag start & dragend
 *  3. set touchstart handlers for groups being moved around
 *  4. set add patron processing
 */
document.onreadystatechange = function () {
    let state = document.readyState;
    if (state == 'complete') {



        applyImportHandler();
        applyManualEntryHandler();
        applyAPIHandler();
        applyPatronDropZoneHandlers();
        applyGroupHandlers();

        // add patron submit processing

        document.getElementById('add-patron').addEventListener('submit', function (e) {
            e.preventDefault();
            let modal = bootstrap.Modal.getInstance(myModal)
            modal.hide();
            addPatron(e);
            applyGroupHandlers();
        });


    }
}


// THINGS TO TRY:
/*
1. touch scroll issue: https://stackoverflow.com/questions/36596562/detect-touch-scroll-up-or-down
2. number keypad for number input vs text
3. drop person into group
4. add people count to bigger group display
4. balancing logic: hill algorithm:
 - https://www.geeksforgeeks.org/introduction-hill-climbing-artificial-intelligence/
 - https://www.geeksforgeeks.org/minimum-cost-to-reach-the-top-of-the-floor-by-climbing-stairs/
 - https://www.geeksforgeeks.org/n-queen-problem-local-search-using-hill-climbing-with-random-neighbour/
 - https://www.educba.com/hill-climbing-algorithm/
 - https://gist.github.com/sunetos/444396
 7. get info from ILLYA
 - max weight for balloons (can hard code)
 - max weight to reserve
 - what exact steps does it take to balance, any hints to first picks per F1-R F1-L, F2-R, F2-L
 - example data
 - picture of balloon for favicon
 - link to reservation site
 */
