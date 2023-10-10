const userDetails = document.querySelector('.user-details');

const start = async()=>{
    const res = await fetch(`http://localhost:4444/auth`,{
        headers:{
            'x-auth-token' : localStorage.getItem('token')
        }
    })
    const resData = await res.json();
    if(res.status >= 400){
        alert(resData.errors[0].msg);
    }else{
        console.log(resData);
        userDetails.innerHTML = `
        <p><strong>Name:</strong> ${resData.user.username}</p>
        <p><strong>Email:</strong> ${resData.user.email}</p>
        <p><strong>Phone:</strong> ${resData.user.phone ? resData.phone : ''}</p>
        <p><strong>Address:</strong> ${resData.user.address ? resData.address : ''}</p>
        `;
    }
    
}

start();