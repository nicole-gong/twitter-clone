$(document).ready(() => {
    if (selectedTab === 'replies')
        loadReplies()
    else
        loadPosts()
})

function loadPosts() {
    $.get('/api/posts', { postedBy: profileUserID, isReply: false }, results => {
        outputPosts(results, $('.postsContainer'))
    })
}
function loadReplies() {
    $.get('/api/posts', { postedBy: profileUserID, isReply: true }, results => {
        outputPosts(results, $('.postsContainer'))
    })
}