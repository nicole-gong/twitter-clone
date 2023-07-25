$(document).ready(() => {
    $.get("/api/posts", res => outputPosts(res, $('.postsContainer')))
})