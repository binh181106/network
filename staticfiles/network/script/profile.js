document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#follow-btn').addEventListener('click', () => followunfollow());
})



function followunfollow() {
    const followBtn = document.querySelector('#follow-btn');
    const followerCount = document.querySelector('#follower_count');
    const userId = followBtn.dataset.userId;

    fetch(`/profile/${userId}/toggle-follow`, {
        method: 'POST',
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            return;
        }

        console.log(data);
        followBtn.textContent = data.is_following ? "Unfollow" : "Follow";
        followerCount.textContent = data.follower_count;
    })
    .catch(error => console.error('Error:', error));
}
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}