const imageDom = document.querySelector('#imageFile');
const submitBtn = document.querySelector('.submit');

let imagePath = '';
imageDom.addEventListener('change', async (e) => {
    e.preventDefault();

    const imageFile = e.target.files[0];
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await axios.post('http://localhost:4444/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'x-auth-token': localStorage.getItem('token'),
            }
    })
    const resData = await res.data;
    if(res.status >= 400){
        alert(resData.errors[0].msg);
    }else{
        alert('image Uploaded');
        imagePath = resData.imagePath;
        console.log(resData.imagePath);
    }
});

submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const productName = document.getElementById('InputName');
    const category = document.getElementById('InputCategory');
    const price = document.getElementById('InputPrice');
    const duration = document.getElementById('InputDuration');
    const desc = document.getElementById('InputDescription');
    const body = {
        productName : productName,
        basePrice: price,
        duration: duration
    };

    if(category !== ''){
        body.category = category;
    }
    if(desc !== ''){
        body.description = desc;
    }
    if(imagePath !== ''){
        body.image = imagePath;
    }

    axios.post('http://localhost:4444/ad',body,{
        headers: {
            'x-auth-token': localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
})