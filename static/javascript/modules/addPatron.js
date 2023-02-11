const myModal = document.getElementById('add-patron-modal')
let guests_added = 0;

const myInput = document.getElementById('weight');
const weight_elm = document.getElementById('weight');

myModal.addEventListener('shown.bs.modal', () => {
    myInput.focus();
})

/* helper function to get list of weights */
function get_weights() {
    // hidden input containing features that is sent to plot
    const list = document.getElementById('weights-entered');
    let list_value;
    try {
        if (list.value !== null && list.value !== "") {
            list_value = JSON.parse(list.value);
        } else {
            list_value = []
        }
    } catch (e) {
        list_value = []
    }
    return list_value;
}


/* create HTML for list for weights entered */
function weights_list() {
    // hidden input containing members that is sent with Create Challenge
    let list = get_weights();
    // features html output container
    const weights_block = document.getElementById('weights-html');
    if (list.length > 0) {
        document.getElementById('entered-weights').classList.remove('hide');
        weights_block.innerHTML = ``;
        for (let i in list) {

            let item = `                     
                     <div class="text-center border">${list[i].weight}</div>
                     <div class="text-center border">
                      <button tabindex=0" id="${list[i].id}" class="weight-remove"><i class="fa-solid fa-trash-can"></i></button>
                     </div>
                `;
            weights_block.innerHTML += item;
        }

        // apply remove handlers
        const remove_btns = document.querySelectorAll('.weight-remove');
        for (const btn of remove_btns) {
            btn.removeEventListener('click', remove_weight);
        }
        for (const btn of remove_btns) {
            btn.addEventListener('click', remove_weight);
        }
    } else {
        weights_block.innerHTML = '';
        document.getElementById('entered-weights').classList.add('hide');

    }
    weight_elm.value = '';
    weight_elm.focus();

}

/* Remove weight entered from list */
function remove_weight(e) {
    e.preventDefault();
    e.stopPropagation();
    const removedItem = e.target.getAttribute('id');
    let list = get_weights();
    list.splice(list.findIndex(({id}) => id == removedItem), 1);
    document.getElementById('weights-entered').value = JSON.stringify(list);
    weights_list();

}


/* send request out to validate weight Form and to then add result to  member_list */
function add_weight() {
    const list = get_weights();
    const new_value = weight_elm.value;
    weight_elm.classList.remove('is-invalid');
    if (new_value.match(/[1-9][0-9]{1,2}/)) {
        //stuff result into list
        list.push({
            'id': Math.floor(Date.now() / 1000),
            'weight': new_value,
        });
        // set weights list value
        document.getElementById('weights-entered').value = JSON.stringify(list);

        // update list displayed on page
        weights_list();

    } else {
        // it's not an integer
        weight_elm.classList.add('is-invalid');
        document.getElementById('feature-name').classList.remove('is-invalid');
        weight_elm.focus();
    }


}


/**
 * addPatron: get name and weight of group and add to names elment
 *
 *  1. read list of weights for group being added
 *  2. clean out json storing data
 *  3. reset touchstart
 */
function addPatron() {
    // get the weight and name values then create a new object
    let name = document.getElementById('name').value;
    if (name.length < 1) {
        name = `Guest ${parseInt(guests_added) + 1}`;
    }
    let weights = [];
    const new_weights = get_weights();
    if (new_weights.length > 0) {
        // check for group of weights
        weights = new_weights.map(({weight}) => weight);
    }
    // check for weight entry being populated
    const new_weight = document.getElementById('weight').value;
    if (new_weight.length > 0 && new_weight.match(/[1-9][0-9]{1,2}/)) {
        weights.push(new_weight);
    }

    if (weights.length > 0) {

        guests_added++;

        let sum = 0;
        for (const weight of weights) {
            sum += parseInt(weight);
        }
        const group_no = document.querySelectorAll('.group:not(.person):not(.guest)').length + parseInt(guests_added) + 1;

        let persons = ``;
        for (const weight of weights) {
            persons += `<div class="person group group-${group_no} d-flex flex-row" draggable="true" data-weight="${weight}" data-count="1" data-group_number="${group_no}" data-name="${name}" style="--translateX:0;--translateY:0;">` +
                `<div class="weight">${weight}</div></div>`;
        }

        let new_element = `<div class="group guest group-${group_no} d-flex flex-column" draggable="true" data-weight="${sum}" data-group_number="${group_no}"style="--translateX:0; --translateY:0;" draggable="true" >` +
            `<div class="group-name" data-group-name="${name}">` +
            `<span class="count">${weights.length}</span>` +
            `<span>-</span>` +
            `<span class="name">${name}</span>` +
            `</div>` +
            `<div class="d-flex flex-row">` +
            `<div class="weight group-weight">${sum}</div>` +
            `<div class="details d-block">` +
            persons +
            `</div></div></div>`;
        document.getElementById('names').insertAdjacentHTML('beforeend', new_element);

    }
    // allow user to close window or submit without anything, no warning
    // clean up form
    document.getElementById("name").value = '';
    document.getElementById('weight').value = '';
    document.getElementById('weights-entered').removeAttribute('value');
    document.getElementById('weights-html').innerHTML = '';
    document.getElementById('entered-weights').classList.add('hide');

}
