$(document).ready(() => {
    $.get("/api/posts", res => outputPosts(res, $('.postsContainer')))
})

function outputPosts(results, container) {
    container.html('')
    console.log(results)
    results.forEach(result => {
        console.log(result)
        var html = createPostHTML(result)
        console.log(html)
        container.append(html)
    })

    if (results.length == 0) 
        container.append("<span>Nothing to show here.</span>")
}