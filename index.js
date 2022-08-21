const contactusForm = document.querySelector('.contact-form');
let name = document.getElementById("fullname5");
let email = document.getElementById("email5");
let subject = document.getElementById("subject5");
let message = document.getElementById('message');

contactusForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let formData = {
        name: name.value,
        email: email.value,
        subject: subject.value,
        message: message.value
    }

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/contactus');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.onload = function () {
        console.log(xhr.responseText);
        if (xhr.responseText == 'success') {
            alert('Email sent');
            name.value = '';
            email.value = '';
            subject.value = '';
            message.value = '';
        } else {
            alert('Something wicked happened!')
        }
    }

    xhr.send(JSON.stringify(formData))

})