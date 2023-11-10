const loginBtn = document.querySelector('.login-btn');

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('InputEmail').value;
    const password = document.getElementById('InputPassword').value;
    //console.log(email,password);

    const body = {
        email: email,
        password: password
    };

    const res = await fetch('https://auction-site-a1vk.onrender.com/auth', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg)
    } else {
        console.log(resData);
        localStorage.setItem('token', resData.token);
        location.href = '/Client/homePage/home.html'
    }

})
