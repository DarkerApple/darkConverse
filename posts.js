// Posts Management with LocalStorage
class PostManager {
    constructor() {
        this.posts = this.loadPosts();
        this.currentPostId = null;
        this.deleteMode = false;
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.initializeEventListeners();
        this.initializeTicTacToe();
    }

    // Load posts from localStorage
    loadPosts() {
        const savedPosts = localStorage.getItem('darkconverse-posts');
        return savedPosts ? JSON.parse(savedPosts) : [];
    }

    // Save posts to localStorage
    savePosts() {
        localStorage.setItem('darkconverse-posts', JSON.stringify(this.posts));
    }

    // Initialize event listeners
    initializeEventListeners() {
        const newPostBtn = document.getElementById('new-post-btn');
        const newPostModal = document.getElementById('new-post-modal');
        const closeBtn = document.querySelector('.close');
        const submitPostBtn = document.getElementById('submit-post');
        const searchBar = document.getElementById('search-bar');
        const submitCommentBtn = document.getElementById('submit-comment');

        // New Post Button
        newPostBtn.onclick = () => {
            newPostModal.style.display = "block";
        };

        // Close Modal
        closeBtn.onclick = () => {
            newPostModal.style.display = "none";
        };

        // Window Click to Close Modal
        window.onclick = (event) => {
            if (event.target == newPostModal) {
                newPostModal.style.display = "none";
            }
        };

        // Submit Post
        submitPostBtn.addEventListener('click', () => this.createPost());

        // Search Posts
        searchBar.addEventListener('input', (e) => this.searchPosts(e.target.value));

        // Submit Comment
        submitCommentBtn.addEventListener('click', () => this.addComment());

        // Backslash key for delete mode
        document.addEventListener('keydown', (e) => {
            if (e.key === '\\') {
                this.toggleDeleteMode();
            }
        });

        // Back to Posts button
        document.getElementById('back-to-posts').addEventListener('click', () => {
            document.getElementById('post-list').style.display = 'block';
            document.getElementById('post-view').style.display = 'none';
            document.body.classList.remove('post-view');
            this.currentPostId = null;
            this.deleteMode = false;
            document.body.classList.remove('show-delete');
            this.renderPosts();
        });

        // Initial render
        this.renderPosts();
    }

    // Create a new post
    createPost() {
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const tag = document.getElementById('post-tag').value;
        const imageFile = document.getElementById('post-image').files[0];

        if (!title || !content) {
            alert('Please enter a title and content');
            return;
        }

        const newPost = {
            id: Date.now(),
            title,
            content,
            tag,
            comments: [],
            likes: 0,
            createdAt: new Date().toISOString()
        };

        // Handle image upload
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPost.image = e.target.result;
                this.addPost(newPost);
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.addPost(newPost);
        }
    }

    // Add post to the list
    addPost(post) {
        this.posts.push(post);
        this.savePosts();
        
        // Close modal and reset form
        document.getElementById('new-post-modal').style.display = "none";
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-tag').value = '';
        document.getElementById('post-image').value = '';

        this.renderPosts();
    }

    // Render posts
    renderPosts(postsToShow = this.posts) {
        const postList = document.getElementById('post-list');
        postList.innerHTML = '';

        const sortedPosts = postsToShow.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        sortedPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <span>Tag: ${post.tag || 'No Tag'}</span>
                <small>Created: ${new Date(post.createdAt).toLocaleString()}</small>
                ${this.deleteMode ? `<button class="delete-button" data-id="${post.id}">Delete</button>` : ''}
                <button class="like-button" data-id="${post.id}">
                    <span>👍</span>
                    <span class="like-count">${post.likes || 0}</span>
                </button>
            `;
            
            postElement.querySelector('h3').onclick = () => this.viewPost(post.id);
            
            if (this.deleteMode) {
                postElement.querySelector('.delete-button').onclick = (e) => {
                    e.stopPropagation();
                    this.deletePost(post.id);
                };
            }

            postElement.querySelector('.like-button').addEventListener('click', (e) => {
                e.stopPropagation();
                this.likePost(post.id);
            });
            
            postList.appendChild(postElement);
        });
    }

    // Search posts
    searchPosts(searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        const filteredPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.content.toLowerCase().includes(searchTerm) || 
            (post.tag && post.tag.toLowerCase().includes(searchTerm))
        );
        this.renderPosts(filteredPosts);
    }

    // View a specific post
    viewPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        document.getElementById('view-title').textContent = post.title;
        document.getElementById('view-content').textContent = post.content;
        document.getElementById('view-tag').textContent = `Tag: ${post.tag || 'No Tag'}`;

        const viewImage = document.getElementById('view-image');
        if (post.image) {
            viewImage.src = post.image;
            viewImage.style.display = 'block';
        } else {
            viewImage.style.display = 'none';
        }

        this.renderComments(post);

        document.getElementById('post-list').style.display = 'none';
        document.getElementById('post-view').style.display = 'block';
        document.body.classList.add('post-view');

        this.currentPostId = postId;
    }

    // Render comments for a post
    renderComments(post) {
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';

        if (post.comments && post.comments.length > 0) {
            post.comments.forEach((comment, index) => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <p>${comment.text}</p>
                    <small>Posted: ${new Date(comment.createdAt).toLocaleString()}</small>
                    ${this.deleteMode ? `<button class="delete-button" data-index="${index}">Delete</button>` : ''}
                `;
                commentsList.appendChild(commentElement);
            });

            if (this.deleteMode) {
                commentsList.querySelectorAll('.delete-button').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.target.getAttribute('data-index'));
                        this.deleteComment(post.id, index);
                    });
                });
            }
        }
    }

    // Add a comment to a post
    addComment() {
        if (!this.currentPostId) return;

        const commentText = document.getElementById('new-comment').value.trim();
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }

        const post = this.posts.find(p => p.id === this.currentPostId);
        if (post) {
            const newComment = { text: commentText, createdAt: new Date().toISOString() };
            post.comments.push(newComment);

            this.savePosts();
            this.renderComments(post);

            // Clear comment input
            document.getElementById('new-comment').value = '';
        }
    }

    // Delete a comment
    deleteComment(postId, commentIndex) {
        const post = this.posts.find(p => p.id === postId);
        if (post && post.comments) {
            post.comments.splice(commentIndex, 1);
            this.savePosts();
            this.renderComments(post);
        }
    }

    // Toggle delete mode on/off when backslash is pressed
    toggleDeleteMode() {
        this.deleteMode = !this.deleteMode;
        document.body.classList.toggle('show-delete', this.deleteMode);
        if (this.currentPostId) {
            this.renderComments(this.posts.find(p => p.id === this.currentPostId));
        } else {
            this.renderPosts();
        }
    }

    // Delete a specific post by ID
    deletePost(postId) {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.savePosts();
        if (this.currentPostId === postId) {
            document.getElementById('post-list').style.display = 'block';
            document.getElementById('post-view').style.display = 'none';
            this.currentPostId = null;
        }
        this.renderPosts();
    }

    // Like a post
    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.likes = (post.likes || 0) + 1;
            this.savePosts();
            this.renderPosts();

            if (post.likes % 100 === 0) {
                this.showCelebration();
            }
        }
    }

    // Show celebration animation
    showCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.style.display = 'flex';
        setTimeout(() => {
            celebration.style.display = 'none';
        }, 2000);
    }

    // Initialize Tic-Tac-Toe game
 initializeTicTacToe() {

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '1') {
                this.toggleTicTacToe();
            }
        });

    const gameBoard = document.getElementById('game-board');
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => this.makeMove(i));
        gameBoard.appendChild(cell);
    }

    // Add close button functionality
    const closeButton = document.createElement('button');
    closeButton.textContent = '✖';
    closeButton.classList.add('close-tic-tac-toe');
    closeButton.addEventListener('click', () => this.toggleTicTacToe());
    
    const ticTacToeContainer = document.getElementById('tic-tac-toe');
    ticTacToeContainer.insertBefore(closeButton, ticTacToeContainer.firstChild);

    document.getElementById('reset-game').addEventListener('click', () => this.resetGame());
}
    
    // Toggle Tic-Tac-Toe game visibility
// Modify the toggleTicTacToe method
toggleTicTacToe() {
    const ticTacToe = document.getElementById('tic-tac-toe');
    const isCurrentlyVisible = ticTacToe.style.display !== 'none';
    
    ticTacToe.style.display = isCurrentlyVisible ? 'none' : 'block';
    
    if (!isCurrentlyVisible) {
        this.resetGame();
    }
}

    // Reset Tic-Tac-Toe game
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.updateBoard();
    }

    // Make a move in Tic-Tac-Toe
    makeMove(index) {
        if (this.board[index] === '') {
            this.board[index] = this.currentPlayer;
            this.updateBoard();
            if (this.checkWinner()) {
                alert(`${this.currentPlayer} wins!`);
                this.resetGame();
            } else if (this.board.every(cell => cell !== '')) {
                alert("It's a draw!");
                this.resetGame();
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                if (this.currentPlayer === 'O') {
                    this.makeAIMove();
                }
            }
        }
    }

    // AI move for Tic-Tac-Toe
    makeAIMove() {
        const emptyCells = this.board.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        setTimeout(() => this.makeMove(randomIndex), 500);
    }

    // Update Tic-Tac-Toe board
    updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
        });
    }

    // Check for a winner in Tic-Tac-Toe
    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        return winPatterns.some(pattern =>
            this.board[pattern[0]] !== '' &&
            this.board[pattern[0]] === this.board[pattern[1]] &&
            this.board[pattern[1]] === this.board[pattern[2]]
        );
    }
}

// Initialize the PostManager when the page loads.
document.addEventListener('DOMContentLoaded', () => { 
   window.postManager = new PostManager(); 
});