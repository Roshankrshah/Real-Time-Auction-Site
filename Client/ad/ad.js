const imageDom = document.querySelector('#imageFile');
const submitBtn = document.querySelector('.submit');
const logoutBtn = document.querySelector('.logout-btn');

let imagePath = '';
imageDom.addEventListener('change', async (e) => {
    e.preventDefault();

    const imageFile = e.target.files[0];
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await axios.post('https://auction-site-a1vk.onrender.com/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token'),
        }
    })
    const resData = await res.data;
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        alert('image Uploaded');
        imagePath = resData.imagePath;
        console.log(resData.imagePath);
    }
});

submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const productName = document.getElementById('InputName').value;
    const category = document.getElementById('InputCategory').value;
    const price = document.getElementById('InputPrice').value;
    const duration = document.getElementById('InputDuration').value;
    const desc = document.getElementById('InputDescription').value;
    const body = {
        productName: productName,
        basePrice: price,
        duration: duration
    };

    if (category !== '') {
        body.category = category;
    }
    if (desc !== '') {
        body.description = desc;
    }
    if (imagePath !== '') {
        body.image = imagePath;
    }

    try {
        const res = await axios.post('https://auction-site-a1vk.onrender.com/ad', body, {
            headers: {
                'x-auth-token': localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        const resData = await res.data;
        alert('Ad Posted');
        console.log(resData);

    } catch (err) {
        console.log(err.response);
        let errMsg = '';
        err.response.data.errors.forEach(error=>{
            errMsg += error.msg;
            errMsg += '\n';
        });

        alert(errMsg);
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = '/Client/index.html';
});

