document.addEventListener('DOMContentLoaded', function() {
    console.log('Static loaded successfully');
    const content = document.querySelector('#content');
    const submitPostButton = document.querySelector('#submitthepost');
    submitPostButton.disabled = true;
    


    // Storage
    localStorage.setItem("current_page", 1)

    let currentTab = 'all-posts';

    if (currentTab === 'all-posts') {
        load_posts(localStorage.getItem("current_page"));
    } else if (currentTab === 'following') {
        load_following_posts();
    }






    // Event listeners for navigation buttons
    document.querySelector('#all-posts-button').addEventListener('click', () => {
        currentTab = 'all-posts';
        load_posts(1);
    });

    document.querySelector('#appear-post-button').addEventListener('click',() => show_post_form());
    document.querySelector('#following-posts').addEventListener('click', () => {
        currentTab = 'following';
        load_following_posts();
    });


    // Toggle like
    document.querySelector('.all-posts').addEventListener('click', function(event) {
        event.preventDefault;
        if (event.target.closest('.like-icon')) {
            console.log('Strarting doing the like function');
            const postContainer = event.target.closest('.post-container');
            const postId = postContainer.dataset.postId;
            fetch(`/like/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data =>{
                if (data.error) {
                    console.error('error:',data.error)
                    return
                }
                console.log('Doing the like function');
                const likeIcon = postContainer.querySelector('.like-icon');
                const likeCount = postContainer.querySelector('#like-count');
                likeIcon.innerHTML = data.is_liking ? `<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M12,0C5.38,0,0,5.38,0,12s5.38,12,12,12,12-5.38,12-12S18.62,0,12,0Zm.57,17.82l-.57,.4-.57-.4c-.56-.39-5.43-3.87-5.43-7.12,0-2.04,1.57-3.7,3.5-3.7,1,0,1.87,.37,2.5,.99,.63-.62,1.5-.99,2.5-.99,1.93,0,3.5,1.66,3.5,3.7,0,3.26-4.87,6.74-5.43,7.12Zm3.43-7.12c0,1.5-2.26,3.73-4,5.06-1.74-1.33-4-3.56-4-5.06,0-.94,.67-1.7,1.5-1.7,.75,0,1.5,.45,1.5,1.45v.55h2v-.55c0-1,.75-1.45,1.5-1.45,.83,0,1.5,.76,1.5,1.7Z"/></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                    <path d="M14.75,7c-1.2,0-2.19,.55-2.75,1.43-.56-.88-1.55-1.43-2.75-1.43-1.79,0-3.25,1.57-3.25,3.5,0,3.36,5.48,7.25,5.71,7.41l.29,.2,.29-.2c.23-.16,5.71-4.05,5.71-7.41,0-1.93-1.46-3.5-3.25-3.5Zm-2.75,9.88c-1.63-1.2-5-4.16-5-6.38,0-1.38,1.01-2.5,2.25-2.5,1.32,0,2.25,.92,2.25,2.23v.77h1v-.77c0-1.31,.93-2.23,2.25-2.23,1.24,0,2.25,1.12,2.25,2.5,0,2.22-3.37,5.18-5,6.38ZM12,0C5.38,0,0,5.38,0,12s5.38,12,12,12,12-5.38,12-12S18.62,0,12,0Zm0,23c-6.07,0-11-4.93-11-11S5.93,1,12,1s11,4.93,11,11-4.93,11-11,11Z"/></svg>`;
                likeCount.innerHTML = data.current_like;
            })
        }
    });

    //Edit function
    document.querySelector('.all-posts').addEventListener('click', function(event) {
        const target = event.target;
    
        if (target.closest('#edit')) {
            event.preventDefault();
    
            // post container and elements
            const postContainer = target.closest('.post-container');
            const username = postContainer.querySelector('strong').innerHTML;
            const postContent = postContainer.querySelector('#post-content').textContent;
            const imgUrl = postContainer.querySelector('.card-img-bottom').src;
    
            // Edit Box Elements
            const editBox = document.querySelector('.edit-container');
            const textarea = editBox.querySelector('.edit-content');
            const editUsername = editBox.querySelector('strong');
            const editImg = editBox.querySelector('img');
    
            // Display the edit box
            document.querySelector('.edit-overlay').style.display = 'flex'; // Show overlay
            editBox.style.display='block';
            textarea.value = postContent;
            editUsername.innerHTML = username;
            editImg.src = imgUrl;
    
            // Set the post ID
            editUsername.dataset.postId = postContainer.dataset.postId;
        }
    });
    
    // Save Edit Button
    document.querySelector('#save-edit').addEventListener('click', function(event) {
        event.preventDefault();
    
        // Edit Box Elements
        const editBox = document.querySelector('.edit-container');
        const newContent = editBox.querySelector('.edit-content').value;
        const postId = editBox.querySelector('strong').dataset.postId;
    
        // Send
        fetch(`/edit/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ content: newContent })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Edit successfully') {
                console.log('Edit complete');
    
                // Update the post content and the timestamp
                const postContainer = document.querySelector(`.post-container[data-post-id="${postId}"]`);
                postContainer.querySelector('#post-content').textContent = newContent;
                postContainer.querySelector('.timestamp').innerHTML=`Update: ${data.updated_timestamp}`;
    
                // Hide the edit box
                document.querySelector('.edit-overlay').style.display = 'none';
            } else {
                console.error('Error:', data.error || 'Failed to edit post.');
            }
        })
        .catch(error => console.error('Error:', error));
    });
    

    //Close edit box button
    document.querySelector('#cancel-edit').addEventListener('click', function(){
        document.querySelector('.edit-overlay').style.display = 'none';
        document.querySelector('.edit-container').style.display='noen';
    });
   
    


    // Disable
    content.addEventListener('input', () => {
        if (content.value.trim()) {
            submitPostButton.disabled = false;
        } else {
            submitPostButton.disabled = true;
        }
    });
    // Submit the form
    submitPostButton.addEventListener('click', function(event) {
        event.preventDefault();
        submit_form();
    });

})




function submit_form() {


    const content = document.querySelector('#content').value;
    if (!content) {
        alert('You have to add your caption!');
        pass;
    }
    const image = document.querySelector('#image').files[0];

    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', image);

    fetch('/post', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);

        if (result.message ==='Successfully upload your post') {
            load_posts(1);
        } else {
            console.error('Failed to upload your post. Error:', result.error)
        }
    })
    .catch(error => console.error('error:', error));

}


function load_posts(page_number) {
    document.querySelector('.all-posts').style.display = 'block';

    fetch(`/home?current_page=${page_number}`)
    .then(response => {
        if (!response.ok) {
            throw new error(`HTTP error, status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

        // Push the post in to the div .all-posts
        const allPost = document.querySelector('.all-posts');
        allPost.innerHTML='';
        allPost.innerHTML = '<div class="posts-list "></div>';
        data.posts.forEach(post => {
            const timestamp = post.post.timestamp;
            const imageUrl = post.post.image ;

            const postContainer = document.createElement('div');
            postContainer.className= 'post-container';
            postContainer.dataset.postId = post.post.id;
            postContainer.innerHTML = `
                            <div class="card">
                            <div class="card-body">
                            <div>
                                <h5 class="card-title"><strong></strong></h5>
                                <div id="edit-btn-container"></div>
                            </div>
                            <p class="card-text" id="post-content">${post.post.content}</p>
                            <p class="card-text"><small class="text-body-secondary timestamp">Update: ${timestamp}</small></p>
                            </div>
                            <img src="${imageUrl}" class="card-img-bottom" alt="${post.post.user}-${post.post.id}">
                            </div>
                            <div class="interactions">
                                <div class="like-icon">
                                    
                                </div>
                                <p style="margin-left:15px;"><strong id="like-count">${post.post.like}</strong></p>
                            </div>`;
            const postUsername = postContainer.querySelector('strong');
            const profileLink = document.createElement('a');
            profileLink.href = post.profile_url;
            profileLink.textContent=post.post.user;
            postUsername.appendChild(profileLink);
            if (!post.has_like) {
                postContainer.querySelector('.like-icon').innerHTML =`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                    <path d="M14.75,7c-1.2,0-2.19,.55-2.75,1.43-.56-.88-1.55-1.43-2.75-1.43-1.79,0-3.25,1.57-3.25,3.5,0,3.36,5.48,7.25,5.71,7.41l.29,.2,.29-.2c.23-.16,5.71-4.05,5.71-7.41,0-1.93-1.46-3.5-3.25-3.5Zm-2.75,9.88c-1.63-1.2-5-4.16-5-6.38,0-1.38,1.01-2.5,2.25-2.5,1.32,0,2.25,.92,2.25,2.23v.77h1v-.77c0-1.31,.93-2.23,2.25-2.23,1.24,0,2.25,1.12,2.25,2.5,0,2.22-3.37,5.18-5,6.38ZM12,0C5.38,0,0,5.38,0,12s5.38,12,12,12,12-5.38,12-12S18.62,0,12,0Zm0,23c-6.07,0-11-4.93-11-11S5.93,1,12,1s11,4.93,11,11-4.93,11-11,11Z"/></svg>`;                       
            } else {
                postContainer.querySelector('.like-icon').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M12,0C5.38,0,0,5.38,0,12s5.38,12,12,12,12-5.38,12-12S18.62,0,12,0Zm.57,17.82l-.57,.4-.57-.4c-.56-.39-5.43-3.87-5.43-7.12,0-2.04,1.57-3.7,3.5-3.7,1,0,1.87,.37,2.5,.99,.63-.62,1.5-.99,2.5-.99,1.93,0,3.5,1.66,3.5,3.7,0,3.26-4.87,6.74-5.43,7.12Zm3.43-7.12c0,1.5-2.26,3.73-4,5.06-1.74-1.33-4-3.56-4-5.06,0-.94,.67-1.7,1.5-1.7,.75,0,1.5,.45,1.5,1.45v.55h2v-.55c0-1,.75-1.45,1.5-1.45,.83,0,1.5,.76,1.5,1.7Z"/></svg>`;
            };

            if (post.post.user === data.page_obj.current_user) {
                postContainer.querySelector('#edit-btn-container').innerHTML='<button id="edit">Edit</button>';
            }
                        
            allPost.append(postContainer);
        });
        create_pagination(data.page_obj);
    })
    .catch(error => console.error('Error:', error));
}

function show_post_form() {
    const postForm = document.querySelector('#post-form');
    if (postForm.style.display === 'none') {
        postForm.style.display = 'block';
    } else {
        postForm.style.display = 'none';
    };
}

function load_following_posts() {
    document.querySelector('.all-posts').style.display = 'block';
    const allPost = document.querySelector('.all-posts');
    allPost.innerHTML='';


    fetch('/home/following')
    .then(response => {
        if (!response.ok) {
            throw new error(`HTTP error, status: ${response.status}`);
        }
        return response.json();
    })
    .then(posts => {
        console.log("Fetch successfully", posts);

        // Push the post in to the div .all-posts
        allPost.innerHTML = '<div class="posts-list "></div>';
        posts.forEach(post => {
            const timestamp = post.post.timestamp;
            const imageUrl = post.post.image ;

            const postContainer = document.createElement('div');
            postContainer.className= 'post-container';
            postContainer.innerHTML = `
                            <div class="card">
                            <div class="card-body">
                            <h5 class="card-title"><strong></strong></h5>
                            <p class="card-text">${post.post.content}</p>
                            <p class="card-text"><small class="text-body-secondary">Update: ${timestamp}</small></p>
                            </div>
                            <img src="${imageUrl}" class="card-img-bottom" alt="${post.post.user}-${post.post.id}">
                            </div>
                            <div class="interactions">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512">
                                    <path d="M14.75,7c-1.2,0-2.19,.55-2.75,1.43-.56-.88-1.55-1.43-2.75-1.43-1.79,0-3.25,1.57-3.25,3.5,0,3.36,5.48,7.25,5.71,7.41l.29,.2,.29-.2c.23-.16,5.71-4.05,5.71-7.41,0-1.93-1.46-3.5-3.25-3.5Zm-2.75,9.88c-1.63-1.2-5-4.16-5-6.38,0-1.38,1.01-2.5,2.25-2.5,1.32,0,2.25,.92,2.25,2.23v.77h1v-.77c0-1.31,.93-2.23,2.25-2.23,1.24,0,2.25,1.12,2.25,2.5,0,2.22-3.37,5.18-5,6.38ZM12,0C5.38,0,0,5.38,0,12s5.38,12,12,12,12-5.38,12-12S18.62,0,12,0Zm0,23c-6.07,0-11-4.93-11-11S5.93,1,12,1s11,4.93,11,11-4.93,11-11,11Z"/></svg>
                                </div>
                                
                            </div>`;
                            const postUsername = postContainer.querySelector('strong');
                            const profileLink = document.createElement('a');
                            profileLink.href = post.profile_url;
                            profileLink.textContent=post.post.user;
                            postUsername.appendChild(profileLink);
                        
            allPost.append(postContainer);
        });
    
    })
    .catch(error => console.error('Error:', error));
}

function create_pagination(page_obj) {
    const allPost = document.querySelector('.all-posts');

    // Remove old pagination
    const oldPagination = document.querySelector('.pagination');
    if (oldPagination) {
        oldPagination.remove();
    }

    // Create new pagination
    const pagination = document.createElement('div');
    pagination.className = "pagination justify-content-center";

    if (page_obj.has_previous) {
        pagination.innerHTML += `
            <button class="page-item" onclick="load_posts(1)">&laquo; First</button>
            <button class="page-item" onclick="load_posts(${page_obj.previous_page_number})">Previous</button>
        `;
    }

    pagination.innerHTML += `
        <button class="page-item" onclick="load_posts(${page_obj.number})">${page_obj.number}</button>
    `;

    if (page_obj.has_next) {
        pagination.innerHTML += `
            <button class="page-item" onclick="load_posts(${page_obj.next_page_number})">Next</button>
            <button class="page-item" onclick="load_posts(${page_obj.paginator.num_pages})">Last &raquo;</button>
        `;
    }

    allPost.appendChild(pagination);
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
