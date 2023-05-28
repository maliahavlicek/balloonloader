const myModal = document.getElementById('add-patron-modal')
let guests_added = 0;


const weight_elm = document.getElementById('weight');
const name_elm = document.getElementById('name');

myModal.addEventListener('shown.bs.modal', () => {
    name_elm.focus();
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
                      <div class="text-center border">${list[i].name}</div>
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
    name_elm.value = '';
    name_elm.focus();

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
    const new_name = name_elm.value;
    name_elm.classList.remove('is-invalid');
    weight_elm.classList.remove('is-invalid');
    if (new_name.length > 1 && new_value.match(/[1-9][0-9]{1,2}/)) {
        //stuff result into list
        list.push({
            'id': Math.floor(Date.now() / 1000),
            'weight': new_value,
            'name': name_elm.value,
        });
        // set weights list value
        document.getElementById('weights-entered').value = JSON.stringify(list);

        // update list displayed on page
        weights_list();

    } else {
        if (!(new_value.match(/[1-9][0-9]{1,2}/))) {
            // it's not an integer
            weight_elm.classList.add('is-invalid');
            weight_elm.focus();
        }
        if (new_name.length < 1) {
            name_elm.classList.add('is-invalid');
            name_elm.focus();

        }
    }


}


/**
 * addPatron: get name and weight of group and add to names element
 *
 *  1. read list of weights for group being added
 *  2. determine if add is to new or existing group
 *  3. clean out json storing data
 *  4. reset touchstart
 */
function addPatron() {
    // get the weight and name values then create a new object

    let weights = [];
    const new_weights = get_weights();

    // check if adding to new group or existing
    const destinationGroup = document.getElementById('group_names');
    const group_to_add_to = destinationGroup.value;
    let additionalWeight = 0;
    if (group_to_add_to.length > 0) {
        const group_name = destinationGroup.options[destinationGroup.selectedIndex].getAttribute('data-group_name')
        const destinationSelector = `#names .group.guest[data-group_number="${group_to_add_to}"] .details`;
        const destinationElm = document.querySelector(destinationSelector);
        let persons = ``;
        for (const weight of new_weights) {
            persons += `<div class="person group group-${group_to_add_to} d-flex flex-row" draggable="true" data-weight="${weight.weight}" data-count="1" data-group_number="${group_to_add_to}" data-name="${group_name}" data-person="${weight.name}" style="--translateX:0;--translateY:0;">` +
                `<div class="edit hide"><i class="fa-solid fa-pen-to-square"></i></div>` +
                `<div class="weight">${weight.weight}</div>` +
                `<div class="guest-name">${weight.name}</div></div>`;
            additionalWeight += parseInt(weight.weight);
        }
        destinationElm.insertAdjacentHTML('beforeend', persons);
        //now adjust group weight and count
        const groupMaster = destinationElm.parentElement.parentElement;
        const newCount = parseInt(groupMaster.querySelector('.group-name .count').innerHTML) + new_weights.length;
        const newWeight = parseInt(groupMaster.querySelector('.weight.group-weight').innerHTML) + parseInt(additionalWeight);
        groupMaster.querySelector('.group-name .count').innerHTML = newCount;
        groupMaster.querySelector('.weight.group-weight').innerHTML = newWeight;

    } else {


        let group_name = new_weights[0].name;
        if (group_name.length < 1) {
            group_name = `Guest ${parseInt(guests_added) + 1}`;
        }
        if (new_weights.length > 0) {
            // check for group of weights
            weights = new_weights;
        }
        // check for weight entry being populated
        const new_weight = document.getElementById('weight').value;
        if (name_elm.value.length > 0 && new_weight.length > 0 && new_weight.match(/[1-9][0-9]{1,2}/)) {
            weights.push({name: name_elm.value, weight: new_weight});
        }

        if (weights.length > 0) {

            guests_added++;

            let sum = 0;
            for (const weight of weights) {
                sum += parseInt(weight.weight);
            }
            const group_no = document.querySelectorAll('.group:not(.person):not(.guest)').length + parseInt(guests_added) + 1;

            let persons = ``;
            for (const weight of weights) {
                persons += `<div class="person group group-${group_no} d-flex flex-row" draggable="true" data-weight="${weight.weight}" data-count="1" data-group_number="${group_no}" data-name="${group_name}" data-person="${weight.name}" style="--translateX:0;--translateY:0;">` +
                    `<div class="edit hide"><i class="fa-solid fa-pen-to-square"></i></div>` +
                    `<div class="weight">${weight.weight}</div>` +
                    `<div class="guest-name">${weight.name}</div></div>`;
            }

            let new_element = `<div class="group guest group-${group_no} d-flex flex-column" draggable="true" data-weight="${sum}" data-group_number="${group_no}"style="--translateX:0; --translateY:0;" draggable="true" >` +
                `<div class="group-name" data-group-name="${group_name}">` +
                `<span class="count">${weights.length}</span>` +
                `<span>-</span>` +
                `<span class="name">${group_name}</span>` +
                `</div>` +
                `<div class="d-flex flex-row">` +
                `<div class="weight group-weight">${sum}</div>` +
                `<div class="details d-block">` +
                persons +
                `</div></div></div>`;
            document.getElementById('names').insertAdjacentHTML('beforeend', new_element);

        }
    }
    // allow user to close window or submit without anything, no warning
    // clean up form
    document.getElementById("name").value = '';
    document.getElementById('weight').value = '';
    document.getElementById('weights-entered').removeAttribute('value');
    document.getElementById('weights-html').innerHTML = '';
    document.getElementById('entered-weights').classList.add('hide');

}


/**
 * applyAddPatronHandler:
 *
 * 1. gather groups in patron that you can add a person to
 * 2. create drop down options for group_names
 *
 */
function applyAddPatronHandler() {
    document.getElementById('add-patron-button').addEventListener('click', (e) => {
        const groups = document.querySelectorAll('#names .group.guest');
        const groupDropdown = document.getElementById('group_names');
        // empty out options
        for (el of groupDropdown.querySelectorAll('option')) {
            el.remove();
        }

        // new group choice
        let new_choice = `<option value="" selected>New Group</option>`;
        groupDropdown.insertAdjacentHTML('beforeend', new_choice);
        // Build up options value is destination to add patrons to
        for (group of groups) {
            const group_name = group.querySelector('.group-name').dataset.groupName;
            const group_number = group.dataset.group_number;
            new_choice = `<option data-group_name="${group_name}" value="${group_number}">${group_name}</option>`;
            groupDropdown.insertAdjacentHTML('beforeend', new_choice);
        }

    });
}