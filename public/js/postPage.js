$(document).ready(() => {
    $.get("/api/posts/" + postID, res => outputPostsWithReplies(res, $('.postsContainer')))
})