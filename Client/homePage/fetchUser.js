
const fetchUser = async(id)=>{
    const res = await fetch(`http://localhost:4444/user/${id}`, {
        headers: {
            'x-auth-token': localStorage.getItem('token')
        }
    })
    const resData = await res.json();
    console.log(resData)
    return resData.user.username;
}

export default fetchUser;