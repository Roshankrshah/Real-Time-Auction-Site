const registerBtn = document.querySelector('.register-btn');

registerBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = document.getElementById('InputUsername').value;
    const email = document.getElementById('InputEmail').value;
    const password = document.getElementById('InputPassword').value;
    const confirmPassword = document.getElementById('InputConfirmPassword').value;
    const address = document.getElementById('InputAddress').value;
    const phone = document.getElementById('InputPhone').value;

    if (password === confirmPassword) {
        const body = {
            username: username,
            email: email,
            password: password,
        }

        if (address != '')
            body.address = address;

        if (phone != '')
            body.phone = phone;

        console.log(body);

        const res = await fetch('http://localhost:4444/user', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const resData = await res.json();
        if(res.status >= 400){
            alert(resData.errors[0].msg)
        }
        console.log(resData);
        
        localStorage.setItem('token', resData.token);
    } else {
        alert('Check Password Again');
    }
})