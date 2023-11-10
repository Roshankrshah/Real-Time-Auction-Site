const adsContainer = document.querySelector('.Ads-container');
const logoutBtn = document.querySelector('.logout-btn');
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

const socket = io('https://auction-site-a1vk.onrender.com');

const start = async () => {
    const res = await fetch(`https://auction-site-a1vk.onrender.com/ad`, {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        console.log(resData);
        const allAds = resData.map(ad => {
            return `
            <div class="card"  style="width: 25rem; height: 25rem;">
            <img src="${ad.image}" class="card-img-top" alt="image">
            <div class="card-body">
              <h5 class="card-title">${ad.productName}</h5>
              <p class="card-text">Price: ₹ ${ad.basePrice.$numberDecimal}</p>
              <p class="card-text">Status: ${ad.auctionStarted === false ?
                    'Upcoming' : ad.auctionEnded === false ?
                        'Ingoing' : 'Completed'}</p>
              <a href="./adDetail.html?adId=${ad._id}" class="btn btn-primary">See Details</a>
            </div>
          </div>
            `
        }).join('');

        adsContainer.innerHTML = allAds;
    }
}

start();

socket.on('addAd', (newAd) => {
    appendAlert('Some new Ads are Available','info');
    console.log(newAd);
    const newCreatedAd = document.createElement('div');
    newCreatedAd.classList.add('card');
    newCreatedAd.style.width = '25rem';
    newCreatedAd.style.height = '25rem';
    newCreatedAd.innerHTML = `
            <img src="${newAd.ad.image}" class="card-img-top" alt="image">
            <div class="card-body">
              <h5 class="card-title">${newAd.ad.productName}</h5>
              <p class="card-text">Price: ₹ ${newAd.ad.basePrice.$numberDecimal}</p>
              <p class="card-text">Status: 'Upcoming'</p>
              <a href="./adDetail.html?adId=${newAd.ad._id}" class="btn btn-primary">See Details</a>
            </div>`;
    adsContainer.insertBefore(newCreatedAd,adsContainer.firstChild);

});

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
