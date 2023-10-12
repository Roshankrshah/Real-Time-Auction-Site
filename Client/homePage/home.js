const adsContainer = document.querySelector('.Ads-container');
const logoutBtn = document.querySelector('.logout-btn');

const start = async()=>{
    const res = await fetch(`http://localhost:4444/ad`, {
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
              <a href="#" class="btn btn-primary">See Details</a>
            </div>
          </div>
            `
        }).join('');

        adsContainer.innerHTML = allAds;
    }
}

start();

logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = '/Client/index.html';
});