const productImageDom = document.querySelector('.product-image');
const productDetailDom = document.querySelector('.product-details');

const adId = window.location.href.split('?')[1].split('=')[1];

console.log(adId);

const start = async()=>{
    const res = await fetch(`http://localhost:4444/ad/${adId}`,{
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });

    const resData = await res.json();
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

start();