// Global variables
let currentUser = null;
let currentPage = 1;
let currentPostId = null;
let currentView = 'auth';

// API base URL
const API_BASE = '/api';

// Utility functions
function getAuthToken() {
    return localStorage.getItem('token');
}

function setAuthToken(token) {
    localStorage.setItem('token', token);
}

function removeAuthToken() {
    localStorage.removeItem('token');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function hideToast() {
    document.getElementById('toast').classList.remove('show');
}

function formatTimeAgo(date) {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return postDate.toLocaleDateString();
}

// API functions
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
}

// Authentication functions
async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        setAuthToken(data.token);
        currentUser = data.user;
        showApp();
        showToast('Login successful!');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function register(userData) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        setAuthToken(data.token);
        currentUser = data.user;
        showApp();
        showToast('Registration successful!');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function verifyToken() {
    try {
        const data = await apiCall('/auth/verify');
        currentUser = data.user;
        showApp();
    } catch (error) {
        showAuth();
    }
}

function logout() {
    removeAuthToken();
    currentUser = null;
    showAuth();
    showToast('Logged out successfully');
}

// UI Navigation functions
function showAuth() {
    currentView = 'auth';
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
}

function showApp() {
    currentView = 'feed';
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'grid';
    document.getElementById('profileContainer').style.display = 'none';
    document.getElementById('navbar').style.display = 'block';
    
    updateNavProfile();
    loadFeed();
    loadSuggestedUsers();
}

function showProfile(username = null) {
    currentView = 'profile';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'block';
    
    const targetUsername = username || currentUser.username;
    loadProfile(targetUsername);
}

function updateNavProfile() {
    if (currentUser) {
        document.getElementById('navProfilePic').src = currentUser.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face';
        document.getElementById('createPostProfilePic').src = currentUser.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face';
    }
}

// Post functions
async function createPost() {
    const content = document.getElementById('postContent').value.trim();
    const visibility = document.getElementById('postVisibility').value;
    
    if (!content) {
        showToast('Please write something to post', 'error');
        return;
    }
    
    try {
        await apiCall('/posts', {
            method: 'POST',
            body: JSON.stringify({ content, visibility })
        });
        
        document.getElementById('postContent').value = '';
        loadFeed();
        showToast('Post created successfully!');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadFeed(page = 1) {
    try {
        const data = await apiCall(`/posts/feed?page=${page}&limit=10`);
        const postsContainer = document.getElementById('postsContainer');
        
        if (page === 1) {
            postsContainer.innerHTML = '';
            currentPage = 1;
        }
        
        if (data.posts.length === 0 && page === 1) {
            postsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No posts to show. Follow some users to see their posts!</p>';
            return;
        }
        
        data.posts.forEach(post => {
            postsContainer.appendChild(createPostElement(post));
        });
        
        // Show/hide load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (data.posts.length === 10) {
            loadMoreBtn.style.display = 'block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.postId = post._id;
    
    const userLiked = post.likes.some(like => like.user === currentUser.id);
    
    postDiv.innerHTML = `
        <div class="post-header">
            <img src="${post.author.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'}" alt="${post.author.firstName}" class="profile-pic">
            <div class="post-author">
                <h4>${post.author.firstName} ${post.author.lastName}</h4>
                <p>@${post.author.username}</p>
            </div>
            <span class="post-time">${formatTimeAgo(post.createdAt)}</span>
        </div>
        <div class="post-content">
            ${post.content}
        </div>
        ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        <div class="post-actions">
            <button class="post-action like-btn ${userLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                <i class="fas fa-heart"></i> <span class="like-count">${post.likes.length}</span>
            </button>
            <button class="post-action comment-btn" onclick="showComments('${post._id}')">
                <i class="fas fa-comment"></i> <span class="comment-count">${post.comments.length}</span>
            </button>
        </div>
    `;
    
    return postDiv;
}

async function toggleLike(postId) {
    try {
        const data = await apiCall(`/likes/post/${postId}`, {
            method: 'POST'
        });
        
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        const likeBtn = postElement.querySelector('.like-btn');
        const likeCount = postElement.querySelector('.like-count');
        
        likeCount.textContent = data.likeCount;
        
        if (data.liked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Comment functions
async function showComments(postId) {
    currentPostId = postId;
    try {
        const data = await apiCall(`/comments/post/${postId}`);
        const commentsContent = document.getElementById('commentsContent');
        
        commentsContent.innerHTML = '';
        
        if (data.comments.length === 0) {
            commentsContent.innerHTML = '<p style="text-align: center; color: #666;">No comments yet. Be the first to comment!</p>';
        } else {
            data.comments.forEach(comment => {
                commentsContent.appendChild(createCommentElement(comment));
            });
        }
        
        document.getElementById('commentModal').style.display = 'block';
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    commentDiv.innerHTML = `
        <img src="${comment.author.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face'}" alt="${comment.author.firstName}" class="profile-pic" style="width: 32px; height: 32px;">
        <div class="comment-content">
            <div class="comment-author">${comment.author.firstName} ${comment.author.lastName}</div>
            <div class="comment-text">${comment.content}</div>
            <div class="comment-actions">
                <span class="comment-action" onclick="toggleCommentLike('${comment._id}')">
                    <i class="fas fa-heart"></i> ${comment.likes.length}
                </span>
                <span>${formatTimeAgo(comment.createdAt)}</span>
            </div>
        </div>
    `;
    
    return commentDiv;
}

async function addComment() {
    const content = document.getElementById('newCommentContent').value.trim();
    
    if (!content) {
        showToast('Please write a comment', 'error');
        return;
    }
    
    try {
        await apiCall('/comments', {
            method: 'POST',
            body: JSON.stringify({
                postId: currentPostId,
                content
            })
        });
        
        document.getElementById('newCommentContent').value = '';
        showComments(currentPostId); // Reload comments
        
        // Update comment count in the post
        const postElement = document.querySelector(`[data-post-id="${currentPostId}"]`);
        const commentCount = postElement.querySelector('.comment-count');
        commentCount.textContent = parseInt(commentCount.textContent) + 1;
        
        showToast('Comment added successfully!');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function toggleCommentLike(commentId) {
    try {
        await apiCall(`/likes/comment/${commentId}`, {
            method: 'POST'
        });
        showComments(currentPostId); // Reload comments to update like count
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// User and profile functions
async function loadProfile(username) {
    try {
        const data = await apiCall(`/users/profile/${username}`);
        const user = data.user;
        
        document.getElementById('profilePicture').src = user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face';
        document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('profileUsername').textContent = `@${user.username}`;
        document.getElementById('profileBio').textContent = user.bio || 'No bio available';
        document.getElementById('postsCount').textContent = user.postsCount;
        document.getElementById('followersCount').textContent = user.followersCount;
        document.getElementById('followingCount').textContent = user.followingCount;
        
        // Show appropriate buttons
        const followBtn = document.getElementById('followBtn');
        const editProfileBtn = document.getElementById('editProfileBtn');
        
        if (user.isOwnProfile) {
            followBtn.style.display = 'none';
            editProfileBtn.style.display = 'inline-block';
        } else {
            editProfileBtn.style.display = 'none';
            followBtn.style.display = 'inline-block';
            followBtn.textContent = user.isFollowing ? 'Unfollow' : 'Follow';
            followBtn.onclick = () => toggleFollow(user.id);
        }
        
        // Load user posts
        loadUserPosts(username);
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadUserPosts(username) {
    try {
        const data = await apiCall(`/posts/user/${username}`);
        const profilePosts = document.getElementById('profilePosts');
        
        profilePosts.innerHTML = '';
        
        if (data.posts.length === 0) {
            profilePosts.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No posts yet.</p>';
        } else {
            data.posts.forEach(post => {
                profilePosts.appendChild(createPostElement(post));
            });
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function toggleFollow(userId) {
    try {
        const followBtn = document.getElementById('followBtn');
        const isFollowing = followBtn.textContent === 'Unfollow';
        
        if (isFollowing) {
            await apiCall(`/follows/${userId}`, { method: 'DELETE' });
            followBtn.textContent = 'Follow';
            showToast('Unfollowed successfully');
        } else {
            await apiCall(`/follows/${userId}`, { method: 'POST' });
            followBtn.textContent = 'Unfollow';
            showToast('Following successfully');
        }
        
        // Update follower count
        const followersCount = document.getElementById('followersCount');
        const currentCount = parseInt(followersCount.textContent);
        followersCount.textContent = isFollowing ? currentCount - 1 : currentCount + 1;
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadSuggestedUsers() {
    try {
        const data = await apiCall('/follows/suggestions');
        const suggestedUsers = document.getElementById('suggestedUsers');
        
        suggestedUsers.innerHTML = '';
        
        if (data.suggestions.length === 0) {
            suggestedUsers.innerHTML = '<p style="color: #666; text-align: center;">No suggestions available</p>';
            return;
        }
        
        data.suggestions.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'suggested-user';
            
            userDiv.innerHTML = `
                <img src="${user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'}" alt="${user.firstName}">
                <div class="suggested-user-info">
                    <h5>${user.firstName} ${user.lastName}</h5>
                    <p>@${user.username}</p>
                </div>
                <button class="follow-btn" onclick="followUser('${user.id}', this)">Follow</button>
            `;
            
            suggestedUsers.appendChild(userDiv);
        });
    } catch (error) {
        console.error('Error loading suggestions:', error);
    }
}

async function followUser(userId, button) {
    try {
        await apiCall(`/follows/${userId}`, { method: 'POST' });
        button.textContent = 'Following';
        button.classList.add('following');
        button.disabled = true;
        showToast('Following successfully');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Search functionality
async function searchUsers(query) {
    if (!query.trim()) {
        document.getElementById('searchResults').style.display = 'none';
        return;
    }
    
    try {
        const data = await apiCall(`/users/search?q=${encodeURIComponent(query)}`);
        const searchResults = document.getElementById('searchResults');
        
        searchResults.innerHTML = '';
        
        if (data.users.length === 0) {
            searchResults.innerHTML = '<div style="padding: 15px; text-align: center; color: #666;">No users found</div>';
        } else {
            data.users.forEach(user => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'search-result-item';
                resultDiv.onclick = () => {
                    showProfile(user.username);
                    document.getElementById('searchInput').value = '';
                    searchResults.style.display = 'none';
                };
                
                resultDiv.innerHTML = `
                    <img src="${user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'}" alt="${user.firstName}">
                    <div>
                        <div>${user.firstName} ${user.lastName}</div>
                        <div style="color: #666; font-size: 0.8rem;">@${user.username}</div>
                    </div>
                `;
                
                searchResults.appendChild(resultDiv);
            });
        }
        
        searchResults.style.display = 'block';
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Profile editing
function showEditProfile() {
    document.getElementById('editFirstName').value = currentUser.firstName;
    document.getElementById('editLastName').value = currentUser.lastName;
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editIsPrivate').checked = currentUser.isPrivate;
    document.getElementById('editProfileModal').style.display = 'block';
}

async function updateProfile(event) {
    event.preventDefault();
    
    const formData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        bio: document.getElementById('editBio').value,
        isPrivate: document.getElementById('editIsPrivate').checked
    };
    
    try {
        const data = await apiCall('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        currentUser = data.user;
        document.getElementById('editProfileModal').style.display = 'none';
        
        // Refresh profile if currently viewing own profile
        if (currentView === 'profile') {
            loadProfile(currentUser.username);
        }
        
        showToast('Profile updated successfully!');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (getAuthToken()) {
        verifyToken();
    } else {
        showAuth();
    }
    
    // Auth form handlers
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        login(email, password);
    });
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const userData = {
            firstName: document.getElementById('registerFirstName').value,
            lastName: document.getElementById('registerLastName').value,
            username: document.getElementById('registerUsername').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value
        };
        register(userData);
    });
    
    // Auth form toggle
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });
    
    document.getElementById('showLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
    
    // Navigation
    document.getElementById('homeLink').addEventListener('click', function(e) {
        e.preventDefault();
        showApp();
    });
    
    document.getElementById('profileLink').addEventListener('click', function(e) {
        e.preventDefault();
        showProfile();
    });
    
    document.getElementById('feedLink').addEventListener('click', function(e) {
        e.preventDefault();
        showApp();
    });
    
    document.getElementById('myProfileLink').addEventListener('click', function(e) {
        e.preventDefault();
        showProfile();
    });
    
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Post creation
    document.getElementById('createPostBtn').addEventListener('click', createPost);
    
    // Comments
    document.getElementById('addCommentBtn').addEventListener('click', addComment);
    
    // Load more posts
    document.getElementById('loadMoreBtn').addEventListener('click', function() {
        currentPage++;
        loadFeed(currentPage);
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchUsers(this.value);
        }, 300);
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-search')) {
            document.getElementById('searchResults').style.display = 'none';
        }
    });
    
    // Profile editing
    document.getElementById('editProfileBtn').addEventListener('click', showEditProfile);
    document.getElementById('editProfileForm').addEventListener('submit', updateProfile);
    
    // Modal close handlers
    document.getElementById('closeEditProfile').addEventListener('click', function() {
        document.getElementById('editProfileModal').style.display = 'none';
    });
    
    document.getElementById('cancelEditProfile').addEventListener('click', function() {
        document.getElementById('editProfileModal').style.display = 'none';
    });
    
    document.getElementById('closeCommentModal').addEventListener('click', function() {
        document.getElementById('commentModal').style.display = 'none';
    });
    
    // Dropdown menu toggle
    document.querySelector('.nav-dropdown-btn').addEventListener('click', function() {
        const menu = document.querySelector('.nav-dropdown-menu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelector('.nav-dropdown-menu').style.display = 'none';
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});
