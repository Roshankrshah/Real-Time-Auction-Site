const productImageDom = document.querySelector('.product-image');
const productDetailDom = document.querySelector('.product-details');
const dynamicContainer = document.querySelector('.dynamic-container');
const statusContainer = document.querySelector('.status-container');
const modifyDom = document.querySelector('.modify-btns');
const updateBtn = document.querySelector('.update-btn');
const logoutBtn = document.querySelector('.logout-btn');
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');

import fetchUser from "./fetchUser.js";

let status, noOfBids, timer, price, bidder;

const socket = io('https://auction-site-a1vk.onrender.com', {
    path: '/socket/adpage'
});


socket.on('auctionStarted', (data) => {
    //alert('Auction Now Started');
    appendAlert('Auction Now Started','info');
    status.innerText = 'Ingoing';
});

socket.on('timer', (data) => {
    timer.innerText = data.data.timer;
});

socket.on('auctionEnded', async(data) => {
    //alert('auction ended');
    if (data.action == 'sold') {
        //alert(`Winner is ${data.winner.username}`)
        console.log('Ended',data);
        const winner = data.winner.username;
        appendAlert(`Auction Ended and Winner is ${winner}`,'success');
    } else {
        //alert('Item Remain Unsold');
        appendAlert(`Auction Ended and Item Remain Unsold `,'danger');
    }
    //console.log('auctionEnded', data);
    //location.reload();
})

socket.on('bidPosted', async (data) => {
    console.log('bid', data.data);
    noOfBids.innerText = data.data.bids.length;
    price.innerText = data.data.currentPrice.$numberDecimal;
    bidder.innerHTML = await fetchUser(data.data.currentBidder);
})


const adId = window.location.href.split('?')[1].split('=')[1];
let roomId, bidPrice, inputBid, startBtn, duration, bidLen = 0, statusValue = 'Not Started Yet',startPrice=0;

console.log(adId);

const start = async () => {
    const res = await fetch(`https://auction-site-a1vk.onrender.com/ad/${adId}`, {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });

    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        console.log(resData);
        startPrice = resData.currentPrice.$numberDecimal;
        roomId = resData.room;
        productImageDom.innerHTML = `
        <h2>${resData.productName}</h2>
        <img src="${resData.image}" alt="Product Image">`;
        productDetailDom.innerHTML = `
        <h2>Product Details</h2>
        <p><strong>Description</strong><br> ${resData.description? resData.description: 'Not Available'}</p>
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
                    <td class="bidder">${resData.purchasedBy ? await fetchUser(resData.purchasedBy) : ''}</td>
                </tr>
            </table>`;
            } else {
                statusContainer.innerHTML += 'Product Unsold'
            }

        }
    }

    const user = await fetch(`https://auction-site-a1vk.onrender.com/auth`, {
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
            const roomDetail = await fetch(`https://auction-site-a1vk.onrender.com/room/${resData.room}`, {
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
    const res = await fetch(`https://auction-site-a1vk.onrender.com/ad/${adId}`, {
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
        location.href = '/homePage/home.html';
    }
}

updateBtn.addEventListener('click', async () => {
    const updatedPrice = document.getElementById('InputPrice').value;
    const body = {
        basePrice: updatedPrice
    };
    console.log('fuck dani');
    const res = await fetch(`https://auction-site-a1vk.onrender.com/ad/${adId}`, {
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
    const res = await fetch(`https://auction-site-a1vk.onrender.com/room/join/${roomId}`, {
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
                    <td class="price">${startPrice}</td>
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
    alertPlaceholder.innerHTML = '';
    bidPrice = inputBid.value;
    const res = await fetch(`https://auction-site-a1vk.onrender.com/bid/${adId}?amount=${bidPrice}`, {
        method: 'POST',
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })

    const resData = await res.json();
    if (res.status >= 400) {
        //alert(resData.errors[0].msg);
        appendAlert(`${resData.errors[0].msg}`,'warning');
    } else {
        console.log(resData);
    }
}

const startAuction = async () => {
    const res = await fetch(`https://auction-site-a1vk.onrender.com/auction/start/${adId}`, {
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
                    <td class="status">Ingoing</td>
                    <td class="noOfBids">0</td>
                    <td class="timer">${duration}</td>
                    <td class="price">${startPrice}</td>
                    <td class="bidder"></td>
                </tr>
            </table>`;
        socket.emit('joinAd', (adId));
        status = document.querySelector('.status');
        noOfBids = document.querySelector('.noOfBids');
        timer = document.querySelector('.timer');
        price = document.querySelector('.price');
        bidder = document.querySelector('.bidder');
    }
}

const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}

logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = '/index.html';
});
