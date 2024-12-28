document.addEventListener('DOMContentLoaded', () => {
    console.groupCollapsed("Profile script loaded")
    const followBtn = document.querySelector('#follow-btn');
    const bioBtn = document.querySelector('.bio-btn');

    if (bioBtn) {
        bioBtn.addEventListener('click', () => bioBox());
    } else {
        console.error('Change button not found.');
    }


    followBtn.addEventListener('click', () => followunfollow());
})



function followunfollow() {
    const followBtn = document.querySelector('#follow-btn');
    const followerCount = document.querySelector('#follower-count');
    const userId = followBtn.dataset.userId;

    followBtn.disabled = true;
    
    
    fetch(`/profile/${userId}/toggle-follow`, {
        method: 'POST',
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error(data.error);
            return;
        }

        console.log(data);
        followBtn.innerHTML = data.is_following ? "Unfollow" : "Follow";
        followerCount.innerHTML = data.follower_count;
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

function bioBox(){
    const bioBox = document.querySelector('.bio-box');
    if (!bioBox){
        console.error("Bio box not found");
        return;
    }
    const bioText = bioBox.querySelector('p').textContent;
    const textArea = document.createElement('textarea');
    
    textArea.rows = 5;
    textArea.cols = 40;
    textArea.style.width = '100%';
    textArea.style.height = '90px';
    textArea.value = bioText;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'btn btn-success mt-2';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-secondary mt-2';


    bioBox.innerHTML='';
    bioBox.appendChild(textArea);
    bioBox.appendChild(saveBtn);
    bioBox.appendChild(cancelBtn);

    // Save
    saveBtn.addEventListener('click', () => {
        const newBio = textArea.value;
        const profileID = document.querySelector('.profile-name').dataset.profileId;
        fetch(`/profile/${profileID}/updatebio`, {
        method: 'POST',
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({bio: newBio})
        })
        .then(response => {
            if (response.ok) {
                bioBox.innerHTML = `<p class="font-italic mb-0">${newBio}</p>`;
                alert('Bio updated successfully!');
            } else {
                alert('Failed to update bio.');
            }
            
        })
        .catch(error => console.error('error: ', error));
    });

    // Cancel
    cancelBtn.addEventListener('click', () => {
        bioBox.innerHTML = `<p class="font-italic mb-0">${bioText}</p>`;
    });

}