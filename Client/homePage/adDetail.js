const productImageDom = document.querySelector('.product-image');
const productDetailDom = document.querySelector('.product-details');
const dynamicContainer = document.querySelector('.dynamic-container');
const statusContainer = document.querySelector('.status-container');
const modifyDom = document.querySelector('.modify-btns');
const updateBtn = document.querySelector('.update-btn');
const logoutBtn = document.querySelector('.logout-btn');

let status, noOfBids, timer, price, bidder;

const socket = io('http://localhost:4444', {
    path: '/socket/adpage'
});


socket.on('auctionStarted', (data) => {
    alert('Auction Now Started');
    status.innerText = 'Ingoing';
});

socket.on('timer', (data) => {
    timer.innerText = data.data.timer;
});

socket.on('auctionEnded', (data) => {
    alert('auction ended');
    if (data.action == 'sold') {
        alert(`Winner is ${data.winner.username}`)
    } else {
        alert('Item Remain Unsold');
    }
    console.log('auctionEnded', data);
})

socket.on('bidPosted', (data) => {
    console.log('bid', data.data);
    noOfBids.innerText = data.data.bids.length;
    price.innerText = data.data.currentPrice.$numberDecimal;
    bidder.innerHTML = data.data.currentBidder;
})


const adId = window.location.href.split('?')[1].split('=')[1];
let roomId, bidPrice, inputBid, startBtn, duration, bidLen = 0, statusValue = 'Not Started Yet';

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
        <br> Base Price: ₹ ${resData.basePrice.$numberDecimal}</p>`;

        if (!resData.auctionStarted) {
            duration = resData.duration;
            statusContainer.innerHTML += `
            <table>
                <tr>
                    <th>Status</th>
                    <th>Duration (seconds)</th>
                    <th>Base Price</th>
                </tr>
                <tr>
                    <td class="status">Upcoming</td>
                    <td class="timer">${resData.duration}</td>
                    <td class="price">${resData.basePrice.$numberDecimal}</td>
                </tr>
            </table>`;

        } else if (!resData.auctionEnded) {
            bidLen = resData.bids.length;
            statusValue = 'Ingoing';
            statusContainer.innerHTML += `
            <table>
                <tr>
                    <th>Status</th>
                    <th>No. of Bids</th>
                    <th>Time Left (seconds)</th>
                    <th>Base Price</th>
                    <th>Current Bidder</th>
                </tr>
                <tr>
                    <td class="status">InGoing</td>
                    <td class="noOfBids">${resData.bids.length}</td>
                    <td class="timer">${resData.timer}</td>
                    <td class="price">${resData.currentPrice.$numberDecimal}</td>
                    <td class="bidder">${resData.currentBidder}</td>
                </tr>
            </table>`;
        } else {
            if (resData.sold) {
                statusContainer.innerHTML += `
            <table>
                <tr>
                    <th>Status</th>
                    <th>No. of Bids</th>
                    <th>Sold Price</th>
                    <th>Winner Bidder</th>
                </tr>
                <tr>
                    <td class="status">Completed(Sold)</td>
                    <td class="noOfBids">${resData.bids.length}</td>
                    <td class="price">${resData.currentPrice.$numberDecimal}</td>
                    <td class="bidder">${resData.purchasedBy ? resData.purchasedBy : ''}</td>
                </tr>
            </table>`;
            } else {
                statusContainer.innerHTML += 'Product Unsold'
            }

        }
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
            if (!resData.sold) {
                dynamicContainer.innerHTML = `<button type="button" class="start-btn btn btn-primary btn-lg">Start Auction</button>`;
                modifyDom.innerHTML = `
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#Modal">Update</button>
            <button type="button" class="delete-btn btn btn-danger">Delete</button>`;

                const deleteBtn = document.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', removeAd);

                startBtn = document.querySelector('.start-btn');
                startBtn.addEventListener('click', startAuction);
            }
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
                console.log('1', user._id, userData.user._id)
                if (user._id == userData.user._id) {
                    userInRoom = true;
                }
            });
            if (!userInRoom) {
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

const joinAuction = async () => {
    console.log(roomId)
    const res = await fetch(`http://localhost:4444/room/join/${roomId}`, {
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
        socket.emit('joinAd', (adId));
        statusContainer.innerHTML = `
            <p><strong>Auction Details</strong></p>
            <table>
                <tr>
                    <th>Status</th>
                    <th>No. of Bids</th>
                    <th>Time Left (seconds)</th>
                    <th>Current Price</th>
                    <th>Current Bidder</th>
                </tr>
                <tr>
                    <td class="status">${statusValue}</td>
                    <td class="noOfBids">${bidLen}</td>
                    <td class="timer">${duration}</td>
                    <td class="price"></td>
                    <td class="bidder"></td>
                </tr>
            </table>`;

        const bidBtn = document.querySelector('.bid-btn');
        status = document.querySelector('.status');
        noOfBids = document.querySelector('.noOfBids');
        timer = document.querySelector('.timer');
        price = document.querySelector('.price');
        bidder = document.querySelector('.bidder');

        inputBid = document.querySelector('.input-bid');
        bidBtn.addEventListener('click', placedBid);
    }

}

const placedBid = async () => {
    bidPrice = inputBid.value;
    const res = await fetch(`http://localhost:4444/bid/${adId}?amount=${bidPrice}`, {
        method: 'POST',
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })

    const resData = await res.json();
    console.log(resData);
}

const startAuction = async () => {
    const res = await fetch(`http://localhost:4444/auction/start/${adId}`, {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        console.log(resData);
        modifyDom.innerHTML = '';
        startBtn.setAttribute('disabled', '');
        /*statusContainer.innerHTML = `
            <p><strong>Auction Details</strong></p>
            <table>
                <tr>
                    <th>Status</th>
                    <th>No. of Bids</th>
                    <th>Time Left (seconds)</th>
                    <th>Base Price</th>
                    <th>Current Bidder</th>
                </tr>
                <tr>
                    <td class="status">Ingoing</td>
                    <td class="noOfBids">0</td>
                    <td class="timer"></td>
                    <td class="price"></td>
                    <td class="bidder"></td>
                </tr>
            </table>`;*/
    }
}


logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = '/Client/index.html';
});