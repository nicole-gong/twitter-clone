$(document).ready(() => {
    $.get("/api/posts", res => outputPosts(res, $('.postsContainer')))
})

function outputPosts(results, container) {
    container.html('')
    results.forEach(result => {
        var html = createPostHTML(result)
        container.append(html)
    })

    if (results.length == 0) 
        container.append("<span>Nothing to show here.</span>")
}