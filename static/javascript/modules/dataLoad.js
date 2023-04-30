const upload = document.querySelector('.upload');
const error = document.querySelector('.file-error');

function createPatrons(items) {
    items.forEach((group, index) => {
        const name = group.Name;
        const total_weight = group.total_weight;
        const weights = group.Weights;

        let new_group = `<div class="group guest group-${index + 1} d-flex flex-column" draggable="true" data-group_number="${index + 1}"style="--translateX:0; --translateY:0;" draggable="true" >` +
            `<div class="group-name" data-group-name="${name}">` +
            `<span class="count">${weights.length}</span>` +
            `<span>-</span>` +
            `<span class="name">${name}</span>` +
            `</div>` +
            `<div class="d-flex flex-row">` +
            `<div class="weight group-weight">${total_weight}</div>` +
            `<div class="details d-block">`;

        weights.forEach((weight) => {

            new_group += `<div class="person group group-${index + 1} d-flex flex-row" data-weight="${weight}" data-count="1" data-group_number="${index + 1}" data-name="${name}" draggable="true" style="--translateX:0;--translateY:0;">` +
                `<div class="weight">${weight}</div>` +
                `</div>`;

        });
        new_group += `</div></div></div>`;
        document.getElementById('names').insertAdjacentHTML('beforeend', new_group);
    });

    // apply group handlers
    applyGroupHandlers();

}

/**
 * loadData: process data load
 *
 *  1. make sure we have a file load
 *  2. TODO check data format
 *  3. populate groups
 *  4. TODO return status
 */
function loadData() {
    const files = document.getElementById('selectFiles').files;

    if (files.length <= 0) {
        const message = "Error: no file selected";
        return {status: 'ERROR', error: message};
    }

    let fr = new FileReader();

    try {
        fr.onload = e => {
            const result = JSON.parse(e.target.result.toString());;
            const items = getGuests(result) ;
            // now we can add the patrons based on this wonderful information
            createPatrons(items);
        };
        fr.readAsText(files.item(0));
    } catch (e) {
        return {status: 'ERROR', error: e.message};
    }

    return {status: 'OK', success: "file data successfully processed"};
}

/**
 *  applyImportHandler:
 *
 *  1. import handler
 */
function applyImportHandler() {
    document.getElementById('import').addEventListener('click', (e) => {
        const error = document.querySelector('.file-error')
        error.classList.add('hide');
        const status = loadData();
        if (status?.status === 'OK') {
            error.classList.add('hide');
            upload.classList.add('hide');
            main.classList.remove('hide');
        } else {
            error.classList.remove('hide');
            error.innerHTML = `<div><p><strong>Error: </strong>${status.error}</p><p>Expected JSON file</p>`;
        }
    });

}


/**
 * API to get weights for a date
 */
function loadApiData(url, company, date) {
    const csrftoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
    let api_url = `${url.slice(0, -1)}?date=${date}&company=${company}`;
    if(!url.includes('http')){
         const domain = `${window.location.protocol}//${window.location.host}`;
         api_url = `${domain}${url}?date=${date}&company=${company}`;
    }

    const options = {
        headers: {
            "Content-type": "application/json",
            'X-CSRFToken': csrftoken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        method: 'GET',
    };

    fetch(api_url, options)
        .then(response => response.json())
        .then(json => {
            const items = getGuests(json.json) ;
            // hide input buttons and show data panels
            upload.classList.add('hide');
            main.classList.remove('hide');
            // now we can add the patrons based on this wonderful information
            createPatrons(items);
        })
        .catch(err => {
            const errorMessageContainer = document.querySelector('.api-error');
            errorMessageContainer.classList.remove('hide');
            document.querySelector('.api-error-message').innerHTML= `API ERROR: ${err}`
        });

}

/** function to create passenger JSON **/
function getGuests(data) {
    const items = data.map(group => {
        // remove 100% duplicated entries in a group
        let uniqueGuests = [
            ... new Map(group.guests.map((item)=> [item["name"] + group['weight'], item])).values(),
        ]
        const Weights = uniqueGuests.map(p => p.weight || 180);
        const display_name = uniqueGuests[0].name.split(" ").length > 1 ? uniqueGuests[0].name.split(" ").at(0) + " " + uniqueGuests[0].name.split(" ").at(-1).substring(0, 1) : uniqueGuests[0].name;
        return {
            Name: display_name,
            Weights,
            uniqueGuests,
            total_weight: Weights.reduce((acc, val) => acc + val, 0),
            confirmation: group.confirmation
        };
    });
    return items;
}

/**
 * function applyAPIHandler()
 * applies listwner to submit button on date picker to kick off validation & API call
 */
function applyAPIHandler() {

    document.getElementById('api_data').addEventListener('click', () => {
        const errorMessage = document.querySelector('.api-error');
        const date = document.getElementById('date').value;
        const company = document.getElementById('company').value;
        const url = document.getElementById('api_url').value;
        const date_element = document.getElementById('date_picked');
        const company_element = document.getElementById('company_picked');
        errorMessage.classList.add('hide');
        // dateInput.classList.remove('is-invalid');
        document.querySelector('.api-error-message').innerHTML = "";
        if (date.length > 0 && date.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/) && company) {
            const [yr, mo, dy] = date.split("-");
            loadApiData(url, company, [mo, dy, yr.substring(2)].join("-"));
            date_element.innerHTML = date;
            company_element.innerHTML = document.getElementById('company').selectedOptions[0].text;
            localStorage.setItem('balloon_loader_default_company', company);
        } else {
            errorMessage.classList.remove('hide');
            // dateInput.classList.add('is-invalid');
            document.querySelector('.api-error-message').innerHTML = "All fields must be filled out.";
        }

    });


}


/**
 *  applyManualEntryHandler:
 *
 *  1. switch to loader view
 *  2. show manual entry modal
 */
function applyManualEntryHandler() {
    document.getElementById('manual').addEventListener('click', (e) => {
        error.classList.add('hide');
        upload.classList.add('hide');
        main.classList.remove('hide');
    });
}