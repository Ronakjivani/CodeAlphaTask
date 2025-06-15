class Dashboard {
    constructor() {
        this.token = localStorage.getItem(STORAGE_KEYS.token);
        this.user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user));
        this.currentProfileUserId = this.user ? this.user._id : null;
        
        if (!this.token || !this.user) {
            window.location.href = 'index.html';
            return;
        }

        this.initializeEventListeners();
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = btn.dataset.section;
                if (sectionId === 'profile-section') {
                    this.currentProfileUserId = this.user._id;
                }
                this.showSection(sectionId);
            });
        });
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Create post form
        document.getElementById('create-post-form').addEventListener('submit', (e) => this.handleCreatePost(e));

        // User search
        const searchInput = document.getElementById('user-search');
        const searchBtn = document.getElementById('search-btn');
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserSearch(searchInput.value);
            }
        });
        
        searchBtn.addEventListener('click', () => {
            this.handleUserSearch(searchInput.value);
        });

        // Add event listeners for comment forms (delegation)
        document.querySelector('.posts-container').addEventListener('submit', (e) => {
            if (e.target.classList.contains('add-comment-form')) {
                e.preventDefault();
                const form = e.target;
                const postId = form.dataset.postId;
                const commentInput = form.querySelector('input[type="text"]');
                const text = commentInput.value;
                if (text.trim()) {
                    this.handleAddComment(postId, text);
                    commentInput.value = '';
                }
            }
        });
    }

    async loadInitialData() {
        try {
            await this.loadUserProfile(this.user.username);
            await this.loadFeed();
            this.updateUI();
        } catch (error) {
            console.error('Error loading initial data:', error);
            if (error.message.includes('unauthorized') || error.message.includes('invalid token')) {
                this.handleLogout();
            }
        }
    }

    async loadUserProfile(username) {
        try {
            const profileData = await api.getCurrentUser();
            this.user = profileData;
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profileData));
        } catch (error) {
            console.error('Error loading user profile:', error);
            throw error;
        }
    }

    async viewUserProfile(username) {
        try {
            const profile = await api.getUserProfile(username);
            this.viewedUser = profile;
            this.currentProfileUserId = profile._id;
            this.showSection('profile-section');
            this.updateUI(this.viewedUser);
        } catch (error) {
            console.error('Error viewing user profile:', error);
        }
    }

    async loadFeed() {
        try {
            const posts = await api.getFeed();
            this.renderPosts(posts);
        } catch (error) {
            console.error('Error loading feed:', error);
            throw error;
        }
    }

    async handleUserSearch(query) {
        if (!query.trim()) {
            document.querySelector('.search-results').classList.add('hidden');
            return;
        }

        try {
            const users = await api.searchUsers(query);
            this.renderSearchResults(users);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    renderSearchResults(users) {
        const container = document.querySelector('.users-list');
        const searchResults = document.querySelector('.search-results');
        
        if (users.length === 0) {
            container.innerHTML = '<p>No users found</p>';
        } else {
            container.innerHTML = users.map(user => this.createUserElement(user)).join('');
            container.querySelectorAll('.user-card h3').forEach(nameElement => {
                nameElement.style.cursor = 'pointer';
                nameElement.onclick = () => this.viewUserProfile(nameElement.textContent);
            });
            container.querySelectorAll('.user-card .user-avatar').forEach(avatarElement => {
                avatarElement.style.cursor = 'pointer';
                const username = avatarElement.nextElementSibling.querySelector('h3').textContent;
                avatarElement.onclick = () => this.viewUserProfile(username);
            });
        }
        
        searchResults.classList.remove('hidden');
    }

    createUserElement(user) {
        const isCurrentUser = this.user && user._id === this.user._id;
        const isFollowing = this.user && this.user.following.includes(user._id);
        const userProfilePic = user.profilePicture && !user.profilePicture.startsWith('http')
            ? `http://localhost:5000/uploads/${user.profilePicture}`
            : 'https://www.bing.com/images/search?view=detailV2&ccid=i3qQLulf&id=237A6B00373EF7C68A9FAA1481516AA70B9CF960&thid=OIP.i3qQLulfg9NApqe_4NaYzgHaHa&mediaurl=https%3a%2f%2fstatic.vecteezy.com%2fsystem%2fresources%2fpreviews%2f018%2f765%2f138%2foriginal%2fuser-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg&exph=1920&expw=1920&q=Profile+Icon&simid=607993157812769128&FORM=IRPRST&ck=E168E86DD85FC7DB81ECCD1E293C3375&selectedIndex=7&itb=0';

        return `
            <div class="user-card">
                <img src="${userProfilePic}" alt="${user.username}" class="user-avatar">
                <div class="user-info">
                    <h3>${user.username}</h3>
                </div>
                ${!isCurrentUser ? 
                  `<button class="follow-btn ${isFollowing ? 'following' : ''}" 
                           onclick="dashboard.handleFollow('${user._id}', ${isFollowing})">
                       ${isFollowing ? 'Following' : 'Follow'}
                   </button>` : ''
                }
            </div>
        `;
    }

    async handleFollow(userId, isFollowing) {
        try {
            if (isFollowing) {
                await api.unfollowUser(userId);
            } else {
                await api.followUser(userId);
            }
            
            if (this.currentProfileUserId === userId || this.currentProfileUserId === this.user._id) {
                await this.viewUserProfile(this.viewedUser ? this.viewedUser.username : this.user.username);
            } else {
                await this.loadUserProfile(this.user.username);
                this.updateUI();
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        }
    }

    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        const createPostNavBtn = document.querySelector('.nav-btn[data-section="create-post-section"]');
        const createPostSection = document.getElementById('create-post-section');
        
        if (createPostNavBtn && createPostSection) {
            const isViewingOwnProfile = sectionId === 'profile-section' && this.currentProfileUserId === this.user._id;
            const isViewingFeed = sectionId === 'feed-section';
            
            if (isViewingOwnProfile || isViewingFeed) {
                createPostNavBtn.classList.remove('hidden');
                if (sectionId === 'create-post-section') {
                    createPostSection.classList.add('active');
                }
            } else {
                createPostNavBtn.classList.add('hidden');
                createPostSection.classList.remove('active');
            }
        }

        document.querySelector('.search-results').classList.add('hidden');
    }

    handleLogout() {
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        window.location.href = 'index.html';
    }

    updateUI(userToDisplay = this.user) {
        if (!userToDisplay) return;

        document.getElementById('profile-username').textContent = userToDisplay.username;

        const defaultProfileImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUAAAJ4AAACUCAMAAABVwGAvAAAAMFBMVEXk5ueutLeor7Lf4uPn6eqrsbXGyszR1NbKztCxt7rb3t++w8W2u77Y29y5vsHO0dM/i/CTAAADtUlEQVR4nO2b3XqDIAxAEQKi8vP+bzvRdq2b3UKQ4AXnanc7XzAQQipEp9PpdDqdTqfT6XQ6nc61AIBKbH+1lvnBqjaaJQTnXAiL9eJGhiBmM0k9PNGD1lOcxS0MQYxBv9y+HfUy3iGE43Aitwcx+MZ+4J08dduRy9xSEOxwHrnvCE5jOz/1Z+ieAWwkB8r9HbpHAEObFJ4xcsnPqQZ+fsLZbX7sdgortw==';

        document.getElementById('profile-picture').src = userToDisplay.profilePicture
            ? (userToDisplay.profilePicture.startsWith('http')
                ? userToDisplay.profilePicture
                : `http://localhost:5000/uploads/${userToDisplay.profilePicture}`)
            : defaultProfileImg;

        document.getElementById('followers-count').textContent = `${userToDisplay.followers?.length || 0} followers`;
        document.getElementById('following-count').textContent = `${userToDisplay.following?.length || 0} following`;
        document.getElementById('posts-count').textContent = `${userToDisplay.posts?.length || 0} posts`;

        this.loadUserPosts(userToDisplay._id);

        const addProfileImageBtn = document.getElementById('add-profile-image-btn');
        if (addProfileImageBtn) {
            if (this.user && userToDisplay._id === this.user._id) {
                addProfileImageBtn.classList.remove('hidden');
            } else {
                addProfileImageBtn.classList.add('hidden');
            }
        }
    }

    async loadUserPosts(userId) {
        try {
            const posts = await api.getUserPosts(userId);
            const profilePostsContainer = document.querySelector('#profile-section .posts-container');
            if (profilePostsContainer) {
                if (posts.length === 0) {
                    profilePostsContainer.innerHTML = '<p>No posts yet.</p>';
                } else {
                    profilePostsContainer.innerHTML = posts.map(post => this.createPostElement(post)).join('');
                }
            }
        } catch (error) {
            console.error('Error loading user posts:', error);
        }
    }

    renderPosts(posts) {
        const container = document.querySelector('#feed-section .posts-container');
        if (container) {
            container.innerHTML = posts.map(post => this.createPostElement(post)).join('');
        }
    }

    createPostElement(post) {
        const postImageUrl = post.image && !post.image.startsWith('http')
            ? `http://localhost:5000/uploads/${post.image}`
            : post.image;
        const commentAvatarDefault = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUAAAJ4AAACUCAMAAABVwGAvAAAAMFBMVEXk5ueutLeor7Lf4uPn6eqrsbXGyszR1NbKztCxt7rb3t++w8W2u77Y29y5vsHO0dM/i/CTAAADtUlEQVR4nO2b3XqDIAxAEQKi8vP+bzvRdq2b3UKQ4AXnanc7XzAQQipEp9PpdDqdTqfT6XQ6nc61AIBKbH+1lvnBqjaaJQTnXAiL9eJGhiBmM0k9PNGD1lOcxS0MQYxBv9y+HfUy3iGE43Aitwcx+MZ+4J08dduRy9xSEOxwHrnvCE5jOz/1Z+ieAWwkB8r9HbpHAEObFJ4xcsnPqQZ+fsLZbX7sdgortw==';

        const userProfilePic = post.user.profilePicture && !post.user.profilePicture.startsWith('http')
            ? `http://localhost:5000/uploads/${post.user.profilePicture}`
            : commentAvatarDefault;

        const commentsHtml = post.comments.map(comment => `
            <div class="comment" data-comment-id="${comment._id}">
                <img src="${comment.user.profilePicture && !comment.user.profilePicture.startsWith('http') ? `http://localhost:5000/uploads/${comment.user.profilePicture}` : (comment.user.profilePicture || commentAvatarDefault)}" alt="${comment.user.username}" class="comment-avatar">
                <div class="comment-content">
                    <p class="comment-author">${comment.user.username}</p>
                    <p class="comment-text">${comment.text}</p>
                </div>
                ${this.user && comment.user._id === this.user._id ? `<button class="delete-comment-btn" onclick="dashboard.handleDeleteComment('${post._id}', '${comment._id}')"><i class="fas fa-times"></i></button>` : ''}
            </div>
        `).join('');

        return `
            <div class="post" data-post-id="${post._id}">
                <div class="post-header">
                    <img src="${userProfilePic}" alt="${post.user.username}" class="post-avatar">
                    <div class="post-info">
                        <h3>${post.user.username}</h3>
                        <span class="post-time">${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="post-content">
                    <img src="${postImageUrl}" alt="Post image" class="post-image">
                    <p class="post-caption">${post.caption || ''}</p>
                </div>
                <div class="post-actions">
                    <button class="like-btn ${post.likes.includes(this.user._id) ? 'liked' : ''}" onclick="dashboard.handleLike('${post._id}')">
                        ${post.likes.length} Likes
                    </button>
                    <button class="comment-btn" onclick="dashboard.showComments('${post._id}')">
                        ${post.comments.length} Comments
                    </button>
                </div>
                <div class="comments-section" data-post-id="${post._id}">
                    <div class="comments-list">${commentsHtml}</div>
                    <form class="add-comment-form" data-post-id="${post._id}">
                        <input type="text" placeholder="Add a comment..." required>
                        <button type="submit">Post</button>
                    </form>
                </div>
            </div>
        `;
    }

    async handleCreatePost(e) {
        e.preventDefault();
        const image = document.getElementById('post-image').files[0];
        const caption = document.getElementById('post-caption').value;

        try {
            await api.createPost({ image, caption });
            e.target.reset();
            await this.loadFeed();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }

    async handleLike(postId) {
        try {
            await api.likePost(postId);
            await this.loadFeed();
        } catch (error) {
            console.error('Error liking post:', error);
        }
    }

    async showComments(postId) {
        const commentsSection = document.querySelector(`.comments-section[data-post-id="${postId}"]`);
        if (commentsSection) {
            if (commentsSection.classList.contains('hidden')) {
                try {
                    const commentsList = commentsSection.querySelector('.comments-list');
                    if (commentsList) commentsList.innerHTML = '';

                    const comments = await api.getComments(postId);
                    const commentsHtml = comments.map(comment => `
                        <div class="comment" data-comment-id="${comment._id}">
                            <img src="${comment.user.profilePicture && !comment.user.profilePicture.startsWith('http') ? `http://localhost:5000/uploads/${comment.user.profilePicture}` : (comment.user.profilePicture || commentAvatarDefault)}" alt="${comment.user.username}" class="comment-avatar">
                            <div class="comment-content">
                                <p class="comment-author">${comment.user.username}</p>
                                <p class="comment-text">${comment.text}</p>
                            </div>
                            ${this.user && comment.user._id === this.user._id ? `<button class="delete-comment-btn" onclick="dashboard.handleDeleteComment('${post._id}', '${comment._id}')"><i class="fas fa-times"></i></button>` : ''}
                        </div>
                    `).join('');
                    if (commentsList) commentsList.innerHTML = commentsHtml;
                } catch (error) {
                    console.error('Error loading comments:', error);
                }
            }
            commentsSection.classList.toggle('hidden');
        }
    }

    async handleDeleteComment(postId, commentId) {
        try {
            await api.deleteComment(postId, commentId);
            if (document.getElementById('feed-section').classList.contains('active')) {
                await this.loadFeed();
            } else if (document.getElementById('profile-section').classList.contains('active')) {
                await this.loadUserPosts(this.currentProfileUserId);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }

    async handleAddComment(postId, text) {
        try {
            await api.addComment(postId, text);
            if (document.getElementById('feed-section').classList.contains('active')) {
                await this.loadFeed();
            } else if (document.getElementById('profile-section').classList.contains('active')) {
                await this.loadUserPosts(this.currentProfileUserId);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new Dashboard();
}); 