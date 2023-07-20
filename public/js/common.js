$('#postTextArea').on('keyup', event => {
    var textbox = $(event.target).val().trim()
    var submitButton = $('#submitPostButton')
    if (textbox == "") {
        submitButton.prop('disabled', true)
        return
    }
    submitButton.prop('disabled', false)
})

$('#submitPostButton').click(event => {
    var button = $(event.target) 
    var data = { content: $('#postTextArea').val() }
    $.post("/api/posts", data, postData => {
        var html = createPostHTML(postData)
        $(".postsContainer").prepend(html)
        $('#postTextArea').val('')
        button.prop("disabled", true)
    })
})

$(document).on("click", ".likeButton", event => {
    var postID = getPostIDfromElement($(event.target))
    console.log(postID)
})

function getPostIDfromElement(element) {
    var rootElement = element.hasClass("post") ? element : element.closest(".post")
    var postID = rootElement.data().id
    return postID
}

function createPostHTML(postData) {
    var postedBy = postData.postedBy
    var displayName = postedBy.firstName + " " + postedBy.lastName
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt))
    return `<div class='post' data-id='${postData._id}'>
                <div class='mainContentContainer'>
                    <div class='userAndPostContainer'>    
                        <div class='userImageContainer'>
                                <img src='${postedBy.profilePic}'></img>
                        </div>
                        <div class='postContentContainer'>
                            <div class='postHeader'>
                                <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                                <span class='username'>@${postedBy.username}</span>
                                <span class='username'>${timestamp}</span>
                            </div>
                            <div class='postBody'>
                                <span>${postData.content}</span>
                            </div>
                        </div>
                    </div>
                    <div class='postFooter'>
                        <div class='postButtonContainer'>
                            <button class='commentButton'>
                                <i class='fa-solid fa-comment'></i>
                            </button>
                            <button class='retweetButton'>
                                <i class='fa-solid fa-retweet'></i>
                            </button>
                            <button class='likeButton'>
                                <i class='fa-regular fa-heart'></i>
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