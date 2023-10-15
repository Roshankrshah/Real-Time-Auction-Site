const productImageDom = document.querySelector('.product-image');
const productDetailDom = document.querySelector('.product-details');
const dynamicContainer = document.querySelector('.dynamic-container');
const modifyDom = document.querySelector('.modify-btns');
const updateBtn = document.querySelector('.update-btn');
const logoutBtn = document.querySelector('.logout-btn');
const timer = document.querySelector('.timer');
const price = document.querySelector('.price');
const bidder = document.querySelector('.bidder');

const socket = io('http://localhost:4444',{
    path: '/socket/adpage'
});


socket.on('auctionStarted',(data)=>{
    alert('Auction Now Started');
});

socket.on('timer',(data)=>{
    timer.innerText = data.data.timer;
});

socket.on('auctionEnded',(data)=>{
    alert('auction ended',data.action);
    alert('Winner', data.winner);
})

socket.on('bidPosted',(data)=>{
    console.log('bid',data.data);
    price.innerText = data.data.currentPrice.$numberDecimal;
    bidder.innerHTML =data.data.currentBidder;
})


const adId = window.location.href.split('?')[1].split('=')[1];
let roomId,bidPrice,inputBid;

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
        roomId = resData.room;
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
                'Upcoming' : resData.auctionEnded === false ?
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
        if (userData.user._id == resData.owner._id) {
            dynamicContainer.innerHTML = `<button type="button" class="start-btn btn btn-primary btn-lg">Start Auction</button>`;
            modifyDom.innerHTML = `
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#Modal">Update</button>
            <button type="button" class="delete-btn btn btn-danger">Delete</button>`;

            const deleteBtn = document.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', removeAd);

            const startBtn = document.querySelector('.start-btn');
            startBtn.addEventListener('click',startAuction);
        } else {
            const roomDetail = await fetch(`http://localhost:4444/room/${resData.room}`, {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            const roomData = await roomDetail.json();
            console.log(roomData);
            let userInRoom = false;
            roomData.users.forEach(user => {
                console.log('1',user._id,userData.user._id)
                if (user._id == userData.user._id) {
                    userInRoom = true;
                }
            });
            if (userInRoom) {
                dynamicContainer.innerHTML = `
                    <input type="number" class="input-field" placeholder="Enter the price(₹)">
                    <button type="button" class="btn btn-primary">Placed Bid</button>`;
            } else {
                dynamicContainer.innerHTML = `
                    <button type="button" class="join-btn btn btn-primary btn-lg">Join Auction</button>`;

                const joinBtn = document.querySelector('.join-btn');
                joinBtn.addEventListener('click', joinAuction);
            }

        }
    }
}

start();

const removeAd = async () => {
    const res = await fetch(`http://localhost:4444/ad/${adId}`, {
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

updateBtn.addEventListener('click', async () => {
    const updatedPrice = document.getElementById('InputPrice').value;
    const body = {
        basePrice: updatedPrice
    };
    console.log('fuck dani');
    const res = await fetch(`http://localhost:4444/ad/${adId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'x-auth-token': localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    });
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        location.reload();
    }
})

const joinAuction = async()=>{
    console.log(roomId)
    const res = await fetch(`http://localhost:4444/room/join/${roomId}`,{
        method: 'POST',
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        console.log(resData);
        dynamicContainer.innerHTML = `
                    <input type="number" class="input-bid" placeholder="Enter the price(₹)">
                    <button type="button" class="bid-btn btn btn-primary">Placed Bid</button>`;
        //location.reload();
        socket.emit('joinAd',(adId));
        const bidBtn = document.querySelector('.bid-btn');
        inputBid = document.querySelector('.input-bid');
        bidBtn.addEventListener('click',placedBid);
    }
    
}

const placedBid = async()=>{
    bidPrice  = inputBid.value;
    const res = await fetch(`http://localhost:4444/bid/${adId}?amount=${bidPrice}`,{
        method: 'POST',
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })

    const resData = await res.json();
    console.log(resData);
}

const startAuction = async()=>{
    const res = await fetch(`http://localhost:4444/auction/start/${adId}`,{
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        console.log(resData);
    }
}


logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = '/Client/index.html';
});