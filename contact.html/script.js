const form = document.querySelector('form');
console.log('form');


const inputs = form.querySelectorAll('input[required], textarea[required], select [required]');


form.setAttribute('novalidate', true); //dane w polu nie sa sprawdzane, jak jest false sa sprawdzane

const displayFieldError = function (elem) {
    const fieldRow = elem.closest('.form-row');
    const fieldError = fieldRow.querySelector('.field-error');

    //jeżeli komunikat z błedem pod polem nie istnieje..


    if (fieldError === null) {
        //pobieramy z pola tekst błedu
        //i tworzymy pole

        const errorText = elem.dataset.error;
        const divError = document.createElement('div');
        divError.classlist.add('field-error');
        divError.innerText = errorText;
        fieldRow.appendChild(divError);
    }

};


const hideFieldError = function (elem) {
    const fieldRow = elem.closest('.form-row');
    const fieldError = fieldRow.querySelector('.field-error');

    //jeżeli pobrane pole isntnieje = usuwamy je

    if (fieldError !== null) {
        fieldError.remove();
    }
};




//zamieniamy inputs na tablicę i robimy po niej pętle
[...inputs].forEach(elem => {

    elem.addEventListener('input', function () {

        if (!this.checkValidity()) {
            this.classList.add('error');
        } else {
            this.classList.remove('error');
            hideFieldError(this);
        }
    });
});


const checkFieldsErrors = function (elements) {
    //ustawiamy zmienną na true. Następnie robimy pętlę po wszystkich polach. Jeżeli  któreś z pól jest błedne, przełaczamy zmienną na false.

    let fieldsAreValid = true;

    [...elements].forEach(elem => {

        if (elem.checkValidity()) {
            hideFieldsError(elem);
            elem.classList.remove('error');
        } else {
            displayFieldError(elem);
            elem.classList.add('error');
            fieldsAreValid = false;
        }
    });

    return fieldsAreValid;
};

form.addEventListener('submit', e => {
    e.preventDefault();
})

//Jeżeli wszystkie pola sa poprawne

if (checkFieldsErrors(inputs)) {
    //generujemy dane jako obiekt dataToSend
    //domyślne elementy disabled nie są wysyłane

    const elements = form.querySelectorAll('input:not(:disabled), textarea:not(:disabled), select:not (:disabled)');


    const dataToSend = newFormData();
    [...elements].forEach(el => dataToSend.append(el.name, el.value));

}

const submit = form.querySelector('[type="submit"]');
submit.disabled = true;
submit.classList.add('element-is-busy');




const url = form.getAttribute('action');
const method = form.getAttribute('method');

fetch(url, {
    method: method.toUpperCase(),
    body: dataToSend
})
    .then(ret => ret.json())
    .then(ret => {
        submit.disabled = false;
        submit.classList.remove('element-is-busy');
    }).catch(_ => {
        submit.disabled = false;
        submit.classList.remove('element-is-busy');
    });




if (ret.errors) {
    ret.errors.map(function (el) {
        return '[name="' + el + '"]'
    });

    const badFields = form.querySelectorAll(ret.errors.join(','));
    checkFieldsErrors(badFields);
} else {
    if (ret.status === 'ok') {
        const div = document.createElement('div');
        div.classList.add('form-send-success');

        form.parentElement.insertBefore(div, form);
        div.innerHTML = '<strong>Wiadomość została wysłana</strong><span>Dziękujemy za kontakt. Postaramy się odpowiedzieć jak najszybciej</span>';
        form.remove();
    }

    if (ret.status === 'error') {
        //jeżeli istnieje komunikat o błędzie wysyłki
        //np. generowany przy poprzednim wysyłaniu formularza
        //usuwamy go, by nie duplikować tych komunikatów
        if (document.querySelector('.send-error')) {
            document.querySelector('.send-error').remove();
        }
        const div = document.createElement('div');
        div.classList.add('send-error');
        div.innerHTML = 'Wysłanie wiadomości się nie powiodło';
        submit.parentElement.appendChild(div);
    }
}

