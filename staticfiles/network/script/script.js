document.addEventListener('DOMContentLoaded', function() {
    console.log('Static loaded successfully');
    const content = document.querySelector('#content');
    const submitPostButton = document.querySelector('#submitthepost');
    submitPostButton.disabled = true;

    document.querySelector('#all-posts-button').addEventListener('click',load_posts);
    document.querySelector('#appear-post-button').addEventListener('click',() => show_post_form());
    


    // Disable
    content.addEventListener('onchange', () => {
        if (!content.value) {
            submitPostButton.disabled= false;
        } else {
            submitPostButton.disabled =true;
        }
    })
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
            load_posts();
        } else {
            console.error('Failed to upload your post. Error:', result.error)
        }
    })
    .catch(error => console.error('error:', error));

}


function load_posts() {
    document.querySelector('.all-posts').style.display = 'block';


    fetch('/home')
    .then(response => {
        if (!response.ok) {
            throw new error(`HTTP error, status: ${response.status}`);
        }
        return response.json();
    })
    .then(posts => {
        console.log(posts);

        // Push the post in to the div .all-posts
        const allPost = document.querySelector('.all-posts');
        allPost.innerHTML='';
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
                                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M14.75,7c-1.2,0-2.19,.55-2.75,1.43-.56-.88-1.55-1.43-2.75-1.43-1.79,0-3.25,1.57-3.25,3.5,0,3.36,5.48,7.25,5.71,7.41l.29,.2,.29-.2c.23-.16,5.71-4.05,5.71-7.41,0-1.93-1.46-3.5-3.25-3.5Zm-2.75,9.88c-1.63-1.2-5-4.16-5-6.38,0-1.38,1.01-2.5,2.25-2.5,1.32,0,2.25,.92,2.25,2.23v.77h1v-.77c0-1.31,.93-2.23,2.25-2.23,1.24,0,2.25,1.12,2.25,2.5,0,2.22-3.37,5.18-5,6.38ZM12,0C5.38,0,0,5.38,0,12s5.38,12,12,12,12-5.38,12-12S18.62,0,12,0Zm0,23c-6.07,0-11-4.93-11-11S5.93,1,12,1s11,4.93,11,11-4.93,11-11,11Z"/></svg>
                                </div>
                                <div>
                                    
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

function show_post_form() {
    const postForm = document.querySelector('#post-form');
    if (postForm.style.display === 'none') {
        postForm.style.display = 'block';
    } else {
        postForm.style.display = 'none';
    };
}

