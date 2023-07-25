$('#postTextArea, #replyTextArea').on('keyup', event => {
    var textbox = $(event.target)
    var value = textbox.val().trim()
    var isModal = textbox.parents('.modal').length == 1
    var submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton')
    if (value == "") {
        submitButton.prop('disabled', true)
        return
    }
    submitButton.prop('disabled', false)
})

$('#submitPostButton, #submitReplyButton').click(event => {
    var button = $(event.target) 

    var isModal = button.parents('.modal').length == 1
    var textbox = isModal ? $('#replyTextArea') : $('#postTextArea')
    var data = { content: textbox.val() }

    if (isModal) {
        var id = button.data().id
        console.log(id)
        data.replyTo = id
    }

    $.post("/api/posts", data, postData => {
        var html = createPostHTML(postData)
        $(".postsContainer").prepend(html)
        textbox.val('')
        button.prop("disabled", true)
    })
})

$(document).on("click", ".likeButton", event => {
    var button = $(event.target)
    var postID = getPostIDfromElement(button)
    $.ajax({
        url: `/api/posts/${postID}/like`,
        method: "PUT",
        success: postData => {
            button.find("span").text(postData.likes.length || "")
            if (postData.likes.includes(userLoggedIn._id))
                button.addClass("active")
            else
                button.removeClass("active")
        }
    })
})
$(document).on("click", ".repostButton", event => {
    var button = $(event.target)
    var postID = getPostIDfromElement(button)
    $.ajax({
        url: `/api/posts/${postID}/repost`,
        method: "POST",
        success: postData => {
            button.find("span").text(postData.repostUsers.length || "")
            if (postData.repostUsers.includes(userLoggedIn._id))
                button.addClass("active")
            else
                button.removeClass("active")
        }
    })
})
$(document).on('show.bs.modal', '#replyModal', event => {
    var button = $(event.relatedTarget)
    var postID = getPostIDfromElement(button)
    $('#submitReplyButton').data('id', postID)
    $.get('/api/posts/' + postID, results => {
        outputPosts(results, $('#originalPostContainer'))
    })
})
$(document).on('hidden.bs.modal', '#replyModal', () => $('#originalPostContainer').html(''))

function outputPosts(results, container) {
    container.html('')
    results.forEach(result => {
        var html = createPostHTML(result)
        container.append(html)
    })

    if (results.length == 0)
        container.append("<span>Nothing to show here.</span>")
}

function getPostIDfromElement(element) {
    var rootElement = element.hasClass("post") == true ? element : element.closest(".post")
    var postID = rootElement.data().id
    return postID
}

function createPostHTML(postData) {
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt))

    // if the post is repost, then change post data's to OP's content
    var isRepost = postData.repostData !== undefined
    var repostedBy = isRepost ? postData.postedBy.username : null
    postData = isRepost ? postData.repostData : postData 

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
    var repostButtonActiveClass = postData.repostUsers.includes(userLoggedIn._id) ? "active" : ""
    var repostText = ""
    if (isRepost)
        repostText = 
            `<span>
                <i class='fa-solid fa-shrimp'></i>
                Recreeted by <a href='/profile/${repostedBy}'>${userLoggedIn.firstName} ${userLoggedIn.lastName}</a>
            </span>`

    return `<div class='post' data-id='${postData._id}'>
                <div class='mainContentContainer'>
                    <div class='postActionContainer'>
                        ${repostText}
                    </div>
                    <div class='userAndPostContainer'>    
                        <div class='userImageContainer'>
                                <img src='${postData.postedBy.profilePic}'></img>
                        </div>
                        <div class='postContentContainer'>
                            <div class='postHeader'>
                                <a href='/profile/${postData.postedBy.username}' class='displayName'>${postData.postedBy.firstName} ${postData.postedBy.lastName}</a>
                                <span class='username'>@${postData.postedBy.username}</span>
                                <span class='username'>${timestamp}</span>
                            </div>
                            <div class='postBody'>
                                <span>${postData.content}</span>
                            </div>
                        </div>
                    </div>
                    <div class='postFooter'>
                        <div class='postButtonContainer'>
                            <button data-bs-toggle='modal' data-bs-target='#replyModal'>
                                <i class='fa-solid fa-comment'></i>
                            </button>
                        </div>
                        <div class='postButtonContainer green'>
                            <button class='repostButton ${repostButtonActiveClass}'>
                                <i class='fa-solid fa-shrimp'></i>
                                <span>${postData.repostUsers.length || ""}</span>
                            </button>
                        </div>
                        <div class='postButtonContainer red'>
                            <button class='likeButton ${likeButtonActiveClass}'>
                                <i class='fa-solid fa-heart'></i>
                                <span>${postData.likes.length || ""}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`
}

// source for "time since" code:
// https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30)
            return 'Just now'
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        if (Math.round(elapsed / msPerMinute) == 1)
            return "1 minute ago"
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        if (Math.round(elapsed / msPerHour) == 1)
            return "1 hour ago"
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        if (Math.round(elapsed / msPerDay) == 1)
            return "1 day ago"
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        if (Math.round(elapsed / msPerMonth) == 1)
            return "1 month ago"
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        if (Math.round(elapsed / msPerYear) == 1)
            return "1 year ago"
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}