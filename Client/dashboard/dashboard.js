const userDetails = document.querySelector('.user-details');
const postAdsDetails = document.querySelector('.postAd-details');
const logoutBtn = document.querySelector('.logout-btn');
const carouselDOM = document.querySelector('.carousel-indicators');
const carouselInner = document.querySelector('.carousel-inner');

const start = async () => {
    const res = await fetch(`http://localhost:4444/auth`, {
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
        <p><strong>Phone:</strong> ${resData.user.phone ? resData.phone : ''}</p>
        <p><strong>Address:</strong> ${resData.user.address ? resData.address : ''}</p>
        `;
    }

    const postAds = await fetch('http://localhost:4444/user/products/posted', {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    });
    const postAdsData = await postAds.json();
    if (res.status >= 400) {
        alert(postAdsData.errors[0].msg);
    } else {
        console.log(postAdsData);
        let totalAds = postAdsData.length;
        
        if(totalAds === 0){
            postAdsDetails.innerHTML = `<p>No ads posted</p>`;
        }else{
            let noOfIndicator = Math.ceil(totalAds/4);
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
                    divEle.innerHTML = `
                    <p><strong>${postAdsData[i+j].productName}</strong></p>
                    <p>Price: ₹ ${postAdsData[i+j].basePrice.$numberDecimal}</p>
                    <p>Status: ${postAdsData[i+j].auctionStarted === false ? 
                        'Upcoming' : postAdsData[i+j].auctionEnded === false ? 
                        'Ingoing' : 'Completed'}
                    `;
                    divContainer.appendChild(divEle);
                    r -=1 ;
                }
                carouselItem.appendChild(divContainer);
                carouselInner.appendChild(carouselItem);
            }
        }
    }

}

logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.href = '/Client/index.html';
});

start();