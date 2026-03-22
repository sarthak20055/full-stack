/* ============================
   CAMPUSCONNECT — script.js
   ============================ */

/* STATE */
let currentUser = null;
let selectedTag = 'General';
let selectedImageData = null;
let allEvents = [];

/* ============================================
   AUTH
   ============================================ */
function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((t, i) => {
        t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
    });
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    if (!email || !pass) { alert('Email aur password dono bharo!'); return; }
    const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
    const found = users.find(u => u.email === email);
    currentUser = found || { name: 'Guest User', email, branch: 'B.Tech', year: '1st Year' };
    localStorage.setItem('cc_current', JSON.stringify(currentUser));
    launchApp();
}

function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const branch = document.getElementById('signup-branch').value.trim();
    const year = document.getElementById('signup-year').value.trim();
    const pass = document.getElementById('signup-pass').value.trim();
    if (!name || !email || !branch || !year || !pass) { alert('Sabhi fields bharna zaroori hai!'); return; }
    const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
    if (users.find(u => u.email === email)) { alert('Yeh email pehle se registered hai!'); return; }
    currentUser = { name, email, branch, year };
    users.push(currentUser);
    localStorage.setItem('cc_users', JSON.stringify(users));
    localStorage.setItem('cc_current', JSON.stringify(currentUser));
    launchApp();
}

function logout() {
    localStorage.removeItem('cc_current');
    currentUser = null;
    document.getElementById('page-app').classList.remove('active');
    document.getElementById('page-auth').classList.add('active');
}

/* ============================================
   APP LAUNCH
   ============================================ */
function launchApp() {
    document.getElementById('page-auth').classList.remove('active');
    document.getElementById('page-app').classList.add('active');
    populateUserUI();
    renderFeed();
    renderProfile();
    renderDoubts();
    renderEvents('all');
}

function populateUserUI() {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('sidebar-user-info').innerHTML =
        '<div class="sidebar-user-av">' + initials + '</div>' +
        '<div class="sidebar-user-text"><strong>' + esc(currentUser.name) + '</strong><small>' + esc(currentUser.branch) + '</small></div>';
    const pAv = document.getElementById('profile-av');
    if (pAv) pAv.textContent = initials;
    const cAv = document.getElementById('create-av');
    if (cAv) cAv.textContent = initials;
    setEl('profile-name', currentUser.name);
    setEl('profile-branch', '🎓 ' + currentUser.branch);
    setEl('profile-year', '📅 ' + currentUser.year);
    setEl('profile-email', '✉️ ' + currentUser.email);
}

function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/* ============================================
   NAVIGATION (SPA)
   ============================================ */
function navigate(page, el) {
    event && event.preventDefault && event.preventDefault();
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById('sec-' + page);
    if (sec) sec.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.mnav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    const pages = ['dashboard', 'profile', 'create', 'discussion', 'events'];
    const idx = pages.indexOf(page);
    const mnavItems = document.querySelectorAll('.mnav-item');
    if (mnavItems[idx]) mnavItems[idx].classList.add('active');
    if (page === 'profile') renderProfile();
}

/* ============================================
   DUMMY DATA
   ============================================ */
const dummyPosts = [
    {
        id: 'dummy1', author: 'Arjun Sharma', time: '2 hours ago', tag: 'Study',
        text: 'Bhai, OS ke notes share karo koi! Kal exam hai aur main abhi padh raha hoon. ExamSeason vibes', likes: 24, comments: []
    },
    {
        id: 'dummy2', author: 'Priya Mehta', time: '4 hours ago', tag: 'Events',
        text: 'Kal ka TechFest registration last date hai! Abhi register karo — spot milega toh accha hai. Main bhi participate kar rahi hoon.', likes: 47, comments: [{ author: 'Rohit', text: 'Main bhi aa raha hoon!' }]
    },
    {
        id: 'dummy3', author: 'Rohan Verma', time: '6 hours ago', tag: 'Funny',
        text: 'Professor ne poora lecture ek hi slide pe khatam kar diya aur bola "rest is self study". Koi explain karo please!', likes: 89, comments: []
    },
    {
        id: 'dummy4', author: 'Sneha Patel', time: '1 day ago', tag: 'Placement',
        text: 'Amazon ka interview crack kar liya! Dono coding rounds clear ho gaye. Preparation ke liye LeetCode aur System Design padho. All the best sabko!', likes: 215, comments: [{ author: 'Arjun', text: 'Congrats yaar!' }, { author: 'Priya', text: 'Amazing! Share karo tips' }]
    },
    {
        id: 'dummy5', author: 'Dev Kumar', time: '1 day ago', tag: 'Study',
        text: 'DSA ke liye ye resources use karo:\n1. Striver SDE Sheet\n2. GFG Practice\n3. LeetCode 75\nConsistency hi key hai!', likes: 62, comments: []
    },
];

const dummyDoubts = [
    {
        id: 'dd1', author: 'Rahul Singh', time: '1 hour ago', subject: 'DSA',
        text: 'Binary search tree mein deletion ka logic samajh nahi aa raha. Koi example ke saath explain kar sakta hai?', upvotes: 8,
        replies: [{ author: 'Priya', text: '3 cases hote hain — node has 0, 1, or 2 children. Main kal detail mein explain karti hoon!' }]
    },
    {
        id: 'dd2', author: 'Anjali Gupta', time: '3 hours ago', subject: 'DBMS',
        text: 'Normalization aur Denormalization mein exact difference kya hota hai? Practical scenario mein kab use karein?', upvotes: 12, replies: []
    },
    {
        id: 'dd3', author: 'Karan Nair', time: '5 hours ago', subject: 'OS',
        text: "Deadlock prevention aur deadlock avoidance mein kya fark hai? Banker's algorithm sirf avoidance mein use hota hai?", upvotes: 6,
        replies: [{ author: 'Dev', text: "Haan, Banker's algorithm resource allocation ke liye safe state check karta hai — avoidance strategy hai!" }]
    },
    {
        id: 'dd4', author: 'Meera Shah', time: '1 day ago', subject: 'Programming',
        text: 'Python mein list comprehension aur generator expression ka performance difference kya hota hai? Memory wise konsa better hai?', upvotes: 19, replies: []
    },
];

const eventsData = [
    {
        id: 'e1', category: 'tech', emoji: '💻', color: '#1e1e4a', title: 'HackSprint 3.0',
        desc: '24-hour hackathon — build something amazing with your team!', date: 'April 5, 2025', time: '10:00 AM', venue: 'CS Lab Block B', spots: '200 spots left', registered: false
    },
    {
        id: 'e2', category: 'cultural', emoji: '🎭', color: '#2a1a2e', title: 'Rangmanch 2025',
        desc: 'Annual cultural fest — dance, drama, music and more!', date: 'April 12, 2025', time: '4:00 PM', venue: 'Main Auditorium', spots: '500 spots left', registered: false
    },
    {
        id: 'e3', category: 'placement', emoji: '💼', color: '#1a2a1e', title: 'Pre-Placement Talk',
        desc: 'Microsoft and Google representatives sharing placement insights.', date: 'March 30, 2025', time: '2:00 PM', venue: 'Seminar Hall 1', spots: '100 spots left', registered: false
    },
    {
        id: 'e4', category: 'sports', emoji: '⚽', color: '#2a1a1a', title: 'Inter-Branch Football',
        desc: 'Annual inter-branch football tournament. Register your team!', date: 'April 8, 2025', time: '9:00 AM', venue: 'Sports Ground', spots: 'Teams of 11', registered: false
    },
    {
        id: 'e5', category: 'tech', emoji: '🤖', color: '#1a1a3a', title: 'AI/ML Workshop',
        desc: 'Hands-on session on Machine Learning with Python — for beginners!', date: 'April 2, 2025', time: '11:00 AM', venue: 'IT Lab 3', spots: '60 spots left', registered: false
    },
    {
        id: 'e6', category: 'cultural', emoji: '🎵', color: '#2a2a1a', title: 'Battle of Bands',
        desc: 'Rock the stage! Solo and band performances welcome.', date: 'April 15, 2025', time: '6:00 PM', venue: 'Open Air Theatre', spots: '20 bands max', registered: false
    },
];

/* ============================================
   FEED / POSTS
   ============================================ */
function getPosts() {
    const stored = JSON.parse(localStorage.getItem('cc_posts') || '[]');
    return [...stored, ...dummyPosts];
}

function renderFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;
    container.innerHTML = getPosts().map(p => buildPostCard(p)).join('');
}

function buildPostCard(post) {
    const initials = post.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const liked = JSON.parse(localStorage.getItem('cc_liked') || '[]').includes(post.id);
    const commentsHTML = (post.comments || []).map(c =>
        '<div class="comment-item"><strong>' + esc(c.author) + '</strong>' + esc(c.text) + '</div>').join('');
    const imgHTML = post.image ? '<img src="' + post.image + '" class="post-img" alt="post"/>' : '';
    return '<div class="post-card" id="post-' + post.id + '">' +
        '<div class="post-header">' +
        '<div class="post-av">' + initials + '</div>' +
        '<div class="post-meta"><strong>' + esc(post.author) + '</strong><small>' + esc(post.time) + '</small></div>' +
        '<span class="post-tag">' + esc(post.tag) + '</span>' +
        '</div>' +
        '<div class="post-body">' + esc(post.text) + '</div>' + imgHTML +
        '<div class="post-actions">' +
        '<button class="action-btn ' + (liked ? 'liked' : '') + '" onclick="toggleLike(\'' + post.id + '\')">' +
        '<i class="fa-' + (liked ? 'solid' : 'regular') + ' fa-heart"></i>' +
        '<span id="like-count-' + post.id + '">' + (post.likes + (liked ? 1 : 0)) + '</span> Likes</button>' +
        '<button class="action-btn" onclick="toggleComment(\'' + post.id + '\')">' +
        '<i class="fa-regular fa-comment"></i><span id="comment-count-' + post.id + '">' + ((post.comments || []).length) + '</span> Comments</button>' +
        '<button class="action-btn" onclick="alert(\'Link copied! (Demo)\')"><i class="fa-solid fa-share-nodes"></i> Share</button>' +
        '</div>' +
        '<div class="comment-box" id="comments-' + post.id + '">' +
        '<div class="comment-input-row">' +
        '<input type="text" id="comment-input-' + post.id + '" placeholder="Write a comment..." />' +
        '<button class="btn-comment-send" onclick="addComment(\'' + post.id + '\')">Send</button>' +
        '</div>' +
        '<div class="comments-list" id="comments-list-' + post.id + '">' + commentsHTML + '</div>' +
        '</div>' +
        '</div>';
}

function toggleLike(postId) {
    const liked = JSON.parse(localStorage.getItem('cc_liked') || '[]');
    const idx = liked.indexOf(postId);
    const btn = document.querySelector('#post-' + postId + ' .action-btn');
    const countEl = document.getElementById('like-count-' + postId);
    const post = getPosts().find(p => p.id === postId);
    if (!post || !btn || !countEl) return;
    if (idx === -1) {
        liked.push(postId);
        countEl.textContent = post.likes + 1;
        btn.classList.add('liked');
        btn.querySelector('i').className = 'fa-solid fa-heart';
    } else {
        liked.splice(idx, 1);
        countEl.textContent = post.likes;
        btn.classList.remove('liked');
        btn.querySelector('i').className = 'fa-regular fa-heart';
    }
    localStorage.setItem('cc_liked', JSON.stringify(liked));
}

function toggleComment(postId) {
    const box = document.getElementById('comments-' + postId);
    if (box) box.classList.toggle('open');
}

function addComment(postId) {
    const input = document.getElementById('comment-input-' + postId);
    const text = input.value.trim();
    if (!text) return;
    const list = document.getElementById('comments-list-' + postId);
    const countEl = document.getElementById('comment-count-' + postId);
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = '<strong>' + (currentUser ? esc(currentUser.name) : 'You') + '</strong>' + esc(text);
    list.appendChild(item);
    countEl.textContent = parseInt(countEl.textContent) + 1;
    input.value = '';
    const stored = JSON.parse(localStorage.getItem('cc_posts') || '[]');
    const sp = stored.find(p => p.id === postId);
    if (sp) { sp.comments = sp.comments || []; sp.comments.push({ author: currentUser ? currentUser.name : 'You', text }); localStorage.setItem('cc_posts', JSON.stringify(stored)); }
}

/* ============================================
   CREATE POST
   ============================================ */
function selectTag(el, tag) {
    document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedTag = tag;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        selectedImageData = e.target.result;
        document.getElementById('image-preview').src = selectedImageData;
        document.getElementById('image-preview-wrap').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    selectedImageData = null;
    document.getElementById('image-preview-wrap').style.display = 'none';
    document.getElementById('image-preview').src = '';
}

function createPost() {
    const text = document.getElementById('post-text').value.trim();
    if (!text) { alert('Post mein kuch toh likho!'); return; }
    const stored = JSON.parse(localStorage.getItem('cc_posts') || '[]');
    stored.unshift({ id: 'post_' + Date.now(), author: currentUser ? currentUser.name : 'You', time: 'Just now', tag: selectedTag, text, image: selectedImageData || null, likes: 0, comments: [] });
    localStorage.setItem('cc_posts', JSON.stringify(stored));
    document.getElementById('post-text').value = '';
    clearImage();
    document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('selected'));
    document.querySelector('.tag-chip').classList.add('selected');
    selectedTag = 'General';
    const toast = document.getElementById('post-toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2800);
    renderFeed();
}

/* ============================================
   PROFILE
   ============================================ */
function renderProfile() {
    if (!currentUser) return;
    populateUserUI();
    const stored = JSON.parse(localStorage.getItem('cc_posts') || '[]');
    const myPosts = stored.filter(p => p.author === currentUser.name);
    const container = document.getElementById('my-posts-container');
    document.getElementById('stat-posts').textContent = myPosts.length;
    if (!container) return;
    container.innerHTML = myPosts.length === 0
        ? '<div style="text-align:center;padding:32px;color:var(--text3);"><i class="fa-regular fa-file" style="font-size:2rem;margin-bottom:12px;display:block;"></i>Abhi tak koi post nahi kiya. Kuch share karo!</div>'
        : myPosts.map(p => buildPostCard(p)).join('');
}

/* ============================================
   DISCUSSIONS / DOUBTS
   ============================================ */
function getDoubts() {
    const stored = JSON.parse(localStorage.getItem('cc_doubts') || '[]');
    return [...stored, ...dummyDoubts];
}

function renderDoubts() {
    const container = document.getElementById('doubts-container');
    if (!container) return;
    container.innerHTML = getDoubts().map(d => buildDoubtCard(d)).join('');
}

function buildDoubtCard(doubt) {
    const initials = doubt.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const upvoted = JSON.parse(localStorage.getItem('cc_upvoted') || '[]').includes(doubt.id);
    const repliesHTML = (doubt.replies || []).map(r =>
        '<div class="reply-item"><strong>' + esc(r.author) + '</strong>' + esc(r.text) + '</div>').join('');
    return '<div class="doubt-card" id="doubt-' + doubt.id + '">' +
        '<div class="doubt-top">' +
        '<div class="doubt-av">' + initials + '</div>' +
        '<div class="doubt-meta"><strong>' + esc(doubt.author) + '</strong><small>' + esc(doubt.time) + '</small></div>' +
        '<span class="doubt-subject-badge">' + esc(doubt.subject) + '</span>' +
        '</div>' +
        '<div class="doubt-body">' + esc(doubt.text) + '</div>' +
        '<div class="doubt-footer">' +
        '<button class="action-btn ' + (upvoted ? 'liked' : '') + '" onclick="upvoteDoubt(\'' + doubt.id + '\')">' +
        '<i class="fa-' + (upvoted ? 'solid' : 'regular') + ' fa-thumbs-up"></i><span id="upvote-' + doubt.id + '">' + (doubt.upvotes + (upvoted ? 1 : 0)) + '</span> Helpful</button>' +
        '<button class="action-btn" onclick="toggleReply(\'' + doubt.id + '\')">' +
        '<i class="fa-regular fa-comment"></i><span id="reply-count-' + doubt.id + '">' + ((doubt.replies || []).length) + '</span> Replies</button>' +
        '</div>' +
        '<div class="reply-box" id="reply-box-' + doubt.id + '">' +
        '<div class="reply-input-row">' +
        '<input type="text" id="reply-input-' + doubt.id + '" placeholder="Write your answer..." />' +
        '<button class="btn-comment-send" onclick="addReply(\'' + doubt.id + '\')">Reply</button>' +
        '</div>' +
        '<div class="replies-list" id="replies-list-' + doubt.id + '">' + repliesHTML + '</div>' +
        '</div>' +
        '</div>';
}

function upvoteDoubt(doubtId) {
    const list = JSON.parse(localStorage.getItem('cc_upvoted') || '[]');
    const idx = list.indexOf(doubtId);
    const btn = document.querySelector('#doubt-' + doubtId + ' .action-btn');
    const countEl = document.getElementById('upvote-' + doubtId);
    const doubt = getDoubts().find(d => d.id === doubtId);
    if (!doubt || !btn || !countEl) return;
    if (idx === -1) {
        list.push(doubtId); countEl.textContent = doubt.upvotes + 1;
        btn.classList.add('liked'); btn.querySelector('i').className = 'fa-solid fa-thumbs-up';
    } else {
        list.splice(idx, 1); countEl.textContent = doubt.upvotes;
        btn.classList.remove('liked'); btn.querySelector('i').className = 'fa-regular fa-thumbs-up';
    }
    localStorage.setItem('cc_upvoted', JSON.stringify(list));
}

function toggleReply(doubtId) {
    const box = document.getElementById('reply-box-' + doubtId);
    if (box) box.classList.toggle('open');
}

function addReply(doubtId) {
    const input = document.getElementById('reply-input-' + doubtId);
    const text = input.value.trim();
    if (!text) return;
    const list = document.getElementById('replies-list-' + doubtId);
    const countEl = document.getElementById('reply-count-' + doubtId);
    const item = document.createElement('div');
    item.className = 'reply-item';
    item.innerHTML = '<strong>' + (currentUser ? esc(currentUser.name) : 'You') + '</strong>' + esc(text);
    list.appendChild(item);
    countEl.textContent = parseInt(countEl.textContent) + 1;
    input.value = '';
    const stored = JSON.parse(localStorage.getItem('cc_doubts') || '[]');
    const sd = stored.find(d => d.id === doubtId);
    if (sd) { sd.replies = sd.replies || []; sd.replies.push({ author: currentUser ? currentUser.name : 'You', text }); localStorage.setItem('cc_doubts', JSON.stringify(stored)); }
}

function postDoubt() {
    const text = document.getElementById('doubt-text').value.trim();
    const subject = document.getElementById('doubt-subject').value;
    if (!text) { alert('Doubt ya question likho pehle!'); return; }
    const stored = JSON.parse(localStorage.getItem('cc_doubts') || '[]');
    stored.unshift({ id: 'doubt_' + Date.now(), author: currentUser ? currentUser.name : 'You', time: 'Just now', subject, text, upvotes: 0, replies: [] });
    localStorage.setItem('cc_doubts', JSON.stringify(stored));
    document.getElementById('doubt-text').value = '';
    renderDoubts();
}

/* ============================================
   EVENTS
   ============================================ */
function renderEvents(filter) {
    allEvents = JSON.parse(localStorage.getItem('cc_events') || JSON.stringify(eventsData));
    const container = document.getElementById('events-container');
    if (!container) return;
    const filtered = filter === 'all' ? allEvents : allEvents.filter(e => e.category === filter);
    container.innerHTML = filtered.length === 0
        ? '<div style="text-align:center;padding:32px;color:var(--text3);grid-column:1/-1;">Is category mein koi event nahi hai abhi.</div>'
        : filtered.map(e => buildEventCard(e)).join('');
}

function buildEventCard(ev) {
    return '<div class="event-card" id="event-' + ev.id + '">' +
        '<div class="event-banner" style="background:' + ev.color + ';">' + ev.emoji + '</div>' +
        '<div class="event-body">' +
        '<h4>' + esc(ev.title) + '</h4>' +
        '<p>' + esc(ev.desc) + '</p>' +
        '<div class="event-info">' +
        '<span><i class="fa-regular fa-calendar"></i>' + esc(ev.date) + '</span>' +
        '<span><i class="fa-regular fa-clock"></i>' + esc(ev.time) + '</span>' +
        '<span><i class="fa-solid fa-location-dot"></i>' + esc(ev.venue) + '</span>' +
        '<span><i class="fa-solid fa-users"></i>' + esc(ev.spots) + '</span>' +
        '</div>' +
        '<button class="btn-register ' + (ev.registered ? 'registered' : '') + '" onclick="registerEvent(\'' + ev.id + '\')">' +
        (ev.registered ? '✓ Registered' : 'Register Now') +
        '</button>' +
        '</div></div>';
}

function filterEvents(filter, el) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderEvents(filter);
}

function registerEvent(eventId) {
    let events = JSON.parse(localStorage.getItem('cc_events') || JSON.stringify(eventsData));
    const ev = events.find(e => e.id === eventId);
    if (!ev || ev.registered) return;
    ev.registered = true;
    localStorage.setItem('cc_events', JSON.stringify(events));
    allEvents = events;
    const btn = document.querySelector('#event-' + eventId + ' .btn-register');
    if (btn) { btn.textContent = '✓ Registered'; btn.classList.add('registered'); }
}

/* ============================================
   UTILS
   ============================================ */
function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

/* ============================================
   INIT
   ============================================ */
window.addEventListener('DOMContentLoaded', function () {
    const saved = localStorage.getItem('cc_current');
    if (saved) { currentUser = JSON.parse(saved); launchApp(); }
});
