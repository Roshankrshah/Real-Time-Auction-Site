const userDetails = document.querySelector('.user-details');
const postAdsContainer = document.querySelector('.postAd-crousel');
const logoutBtn = document.querySelector('.logout-btn');
const carouselDOM = document.querySelector('.carousel-indicators');
const carouselInner = document.querySelector('.carousel-inner');
const purchasedDom = document.querySelector('.purchased-items');

const start = async () => {
    const res = await fetch(`https://auction-site-a1vk.onrender.com/auth`, {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })
    const resData = await res.json();
    if (res.status >= 400) {
        alert(resData.errors[0].msg);
    } else {
        console.log(resData);
        userDetails.innerHTML = `
        <p><strong>Name:</strong> ${resData.user.username}</p>
        <p><strong>Email:</strong> ${resData.user.email}</p>
        <p><strong>Phone:</strong> ${resData.user.phone ? resData.user.phone : ''}</p>
        <p><strong>Address:</strong> ${resData.user.address ? resData.user.address : ''}</p>
        `;
    }

    const postAds = await fetch('https://auction-site-a1vk.onrender.com/user/products/posted', {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });
    const postAdsData = await postAds.json();
    if (postAds.status >= 400) {
        alert(postAdsData.errors[0].msg);
    } else {
        console.log(postAdsData);
        let totalAds = postAdsData.length;
        
        if(totalAds === 0){
            postAdsContainer.innerHTML = `<p>No ads posted</p>`;
        }else{
            let noOfIndicator = Math.ceil(totalAds/3);
            console.log(noOfIndicator);

            for(let i=0; i<noOfIndicator;i++){
                const btn = document.createElement('button');
                btn.setAttribute('type','button');
                btn.setAttribute('data-bs-target','#carouselExampleIndicators');
                btn.setAttribute('data-bs-slide-to',`${i}`);
                btn.setAttribute('aria-label',`Slide ${i+1}`);
                if(i === 0){
                    btn.classList.add('active');
                    btn.setAttribute('aria-current','true');
                }
                carouselDOM.appendChild(btn);
            }
            r = totalAds;
            for(let i = 0; i<noOfIndicator;i++){
                const carouselItem= document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if(i === 0){
                    carouselItem.classList.add('active');
                }
                const divContainer = document.createElement('div');
                divContainer.classList.add('postAds-container');

                for(let j=0;j<3 && r != 0 ;j++){
                    const divEle = document.createElement('div');
                    divEle.classList.add('single-ad');
                    divEle.setAttribute('data-id',`${postAdsData[(i*3)+j]._id}`)
                    divEle.innerHTML = `
                    <p><strong>${postAdsData[(i*3)+j].productName}</strong></p>
                    <p>Price: ₹ ${postAdsData[(i*3)+j].basePrice.$numberDecimal}</p>
                    <p>Status: ${postAdsData[(i*3)+j].auctionStarted === false ? 
                        'Upcoming' : postAdsData[(i*3)+j].auctionEnded === false ? 
                        'Ingoing' : 'Completed'}
                    `;
                    divContainer.appendChild(divEle);
                    r -=1 ;
                }
                carouselItem.appendChild(divContainer);
                carouselInner.appendChild(carouselItem);
                const EveryAds = document.querySelectorAll('.single-ad');
                EveryAds.forEach((singleAd)=>{
                    singleAd.addEventListener('click',viewDetail);
                })
            }
        }
    }

    const purchasedItem  = await fetch('https://auction-site-a1vk.onrender.com/user/products/purchased',{
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });
    const purchasedData = await purchasedItem.json();

    if (purchasedItem.status >= 400) {
        alert(purchasedData.errors[0].msg);
    } else {
        if(purchasedData.length === 0){
            purchasedDom.innerHTML = `<p>No purchased product available</p>`;
        }else{
            console.log(purchasedData)
            purchasedData.forEach(item => {
                purchasedDom.innerHTML += `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.currentPrice.$numberDecimal}</td>
                    <td>${new Date(item.updatedAt).toLocaleString()}</td>
                </tr>
                `
            })
            
        }
    }
}

const viewDetail = async(e)=>{
    location.href = `../homePage/adDetail.html?adId=${e.currentTarget.dataset.id}`;
}

logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = '/Client/index.html';
});

start();
