const productImageDom = document.querySelector('.product-image');
const productDetailDom = document.querySelector('.product-details');
const dynamicContainer = document.querySelector('.dynamic-container');
const modifyDom = document.querySelector('.modify-btns');

const adId = window.location.href.split('?')[1].split('=')[1];

console.log(adId);

const start = async () => {
    const res = await fetch(`http://localhost:4444/ad/${adId}`, {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });

    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        console.log(resData);
        productImageDom.innerHTML = `
        <h2>${resData.productName}</h2>
        <img src="${resData.image}" alt="Product Image">`;
        productDetailDom.innerHTML = `
        <h2>Product Details</h2>
        <p><strong>Description</strong><br> ${resData.description}</p>
        <p><strong>Info</strong><br> Posted on: ${new Date(resData.updatedAt).toLocaleString()}
        <br> Seller: ${resData.owner.username}
        <br> Base Price: ₹ ${resData.basePrice.$numberDecimal}</p>
        <p><strong> Auction</strong><br>
        Status: ${resData.auctionStarted === false ?
                'Upcoming' : ad.auctionEnded === false ?
                    'Ingoing' : 'Completed'}
        <br>Bids: ${resData.bids.length}
        <br>Time remaining: 
        <br>Current Price: ₹ ${resData.currentPrice.$numberDecimal}
        <br> Current Bidder: </p>`
    }

    const user = await fetch(`http://localhost:4444/auth`, {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })
    const userData = await user.json();
    if (user.status >= 400) {
        alert(userData.errors[0].msg);
    } else {
        if(userData.user._id == resData.owner._id){
            dynamicContainer.innerHTML = `<button type="button" class="btn btn-primary btn-lg">Start Auction</button>`;
            modifyDom.innerHTML = `
            <button type="button" class="update-btn btn btn-primary ">Update</button>
            <button type="button" class="delete-btn btn btn-danger">Delete</button>`;

            const deleteBtn = document.querySelector('.delete-btn');
            deleteBtn.addEventListener('click',removeAd)
        }else{
            dynamicContainer.innerHTML = `
            <input type="number" class="input-field" placeholder="Enter the price(₹)">
            <button type="button" class="btn btn-primary">Placed Bid</button>`;
        }
    }
}

start();

const removeAd = async()=>{
    const res = await fetch(`http://localhost:4444/ad/${adId}`,{
        method: 'DELETE',
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        alert(resData.msg);
        location.href = '/Client/homePage/home.html';
    }
}
