// globals
var cropper;

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
        data.replyTo = id
    }

    $.post("/api/posts", data, postData => {
        if (postData.replyTo) {
            textbox.val('')
            location.reload()
        }
        else {
            var html = createPostHTML(postData)
            $(".postsContainer").prepend(html)
            textbox.val('')
            button.prop("disabled", true)
        }
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
$(document).on("click", ".post", event => {
    var element = $(event.target)
    var postID = getPostIDfromElement(element)

    if (postID !== undefined && !element.is('button') && !element.is('i')) {
        console.log(element)
        window.location.href = '/posts/' + postID
    }
})
$(document).on('click', '.followButton', event => {
    var button = $(event.target)
    var userID = button.data().user
    console.log(userID)
    $.ajax({
        url: `/api/users/${userID}/follow`,
        method: "PUT",
        success: (userData, status, xhr) => {
            if (xhr.status == 404) return
            var difference = 1
            if (userData.following && userData.following.includes(userID)) {
                button.addClass('following')
                button.text('Following')
            }
            else {
                button.removeClass('following')
                button.text('Follow')
                difference = -1
            }

            var followersLabel = $('#followersValue') 
            if (followersLabel.length != 0) {
                var followersText = parseInt(followersLabel.text())
                followersLabel.text(followersText + difference)
            }
        }
    })
})

$(document).on('show.bs.modal', '#replyModal', event => {
    var button = $(event.relatedTarget)
    var postID = getPostIDfromElement(button)
    $('#submitReplyButton').data('id', postID)
    $.get('/api/posts/' + postID, results => 
        outputPosts(new Array(results.postData), $('#originalPostContainer'))
    )
})
$(document).on('hidden.bs.modal', '#replyModal', () => $('#originalPostContainer').html(''))

$(document).on('show.bs.modal', '#deletePostModal', event => {
    var button = $(event.relatedTarget)
    var postID = getPostIDfromElement(button)
    $('#deletePostButton').data('postID', postID)
})
// This can be handled directly instead of on document load like the rest of them because it's 
// inside a modal, which means it'll guarantee to have loaded
$('#deletePostButton').click(event => {
    var postID = $(event.target).data('postID')
    console.log(postID)
    $.ajax({
        url: `/api/posts/${postID}`,
        method: "DELETE",
        success: (data, status, xhr) => {
            if (xhr.status != 202) {
                alert("Could not delete post. Please try again later.")
                return
            }
            location.reload()
        }
    })
})

// picture cropping
$('#filePhoto').change(function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader()
        reader.onload = event => {
            var image = document.getElementById('imagePreview')
            image.src = event.target.result
            if (cropper !== undefined) 
                cropper.destroy()

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false,
                viewmode: 2,
                autoCropArea: 1
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})
$('#coverPhoto').change(function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader()
        reader.onload = event => {
            var image = document.getElementById('coverPreview')
            image.src = event.target.result
            if (cropper !== undefined) 
                cropper.destroy()

            cropper = new Cropper(image, {
                aspectRatio: 3 / 1,
                background: false,
                viewmode: 2,
                autoCropArea: 1
            })
        }
        reader.readAsDataURL(this.files[0])
    }
})
$('#imageUploadButton').click(() => {
    var canvas = cropper.getCroppedCanvas()
    if (canvas == null) {
        alert("Could not upload image. Please try a different file format.")
        return
    }
    
    canvas.toBlob(blob => {
        var formData = new FormData()
        formData.append('croppedImage', blob)
        $.ajax({
            url: '/api/users/profilePicture',
            type: 'POST',
            data: formData,
            // prevents jquery from converting data to string
            processData: false,
            // for image uploads (jquery adds its own boundary string otherwise)
            contentType: false,
            success: () => location.reload()
        })
    })
})
$('#coverPhotoButton').click(() => {
    var canvas = cropper.getCroppedCanvas()
    if (canvas == null) {
        alert("Could not upload image. Please try a different file format.")
        return
    }
    
    canvas.toBlob(blob => {
        var formData = new FormData()
        formData.append('croppedImage', blob)
        $.ajax({
            url: '/api/users/coverPhoto',
            type: 'POST',
            data: formData,
            // prevents jquery from converting data to string
            processData: false,
            // for image uploads (jquery adds its own boundary string otherwise)
            contentType: false,
            success: () => location.reload()
        })
    })
})

function outputPosts(results, container) {
    container.html('')
    results.forEach(result => {
        var html = createPostHTML(result)
        container.append(html)
    })

    if (results.length == 0)
        container.append("<span class=emptyPost>Nothing to show here.</span>")
}
function outputPostsWithReplies(results, container) {
    container.html('')
    if (results.postData.replyTo !== undefined && results.postData.replyTo._id !== undefined) {
        var html = createPostHTML(results.postData.replyTo)
        container.append(html)
    }
    var html = createPostHTML(results.postData, true)
    container.append(html)

    results.replies.forEach(result => {
        html = createPostHTML(result)
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

function createPostHTML(postData, largeFont = false) {
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt))

    // if the post is repost, then change post data's to OP's content
    var isRepost = postData.repostData !== undefined
    var repostedBy = isRepost ? postData.postedBy.username : null
    postData = isRepost ? postData.repostData : postData 

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""
    var repostButtonActiveClass = postData.repostUsers.includes(userLoggedIn._id) ? "active" : ""
    var largeFontClass = largeFont ? "largeFont" : ""
    var repostText = ""
    if (isRepost)
        repostText = 
            `<span>
                <i class='fa-solid fa-shrimp'></i>
                Recreeted by <a href='/profile/${repostedBy}' class='toUnderline'>${userLoggedIn.firstName} ${userLoggedIn.lastName}</a>
            </span>`
    
    var replyFlag = ""
    if (postData.replyTo && postData.replyTo._id) {
        var replyToName = postData.replyTo.postedBy.username
        replyFlag = 
            `<div class='replyFlag'>
                Replying to <a href='/profile/${replyToName}' class='toUnderline'>@${replyToName}</a>
            </div>`
    }

    var deleteButton = ""
    if (postData.postedBy._id == userLoggedIn._id)
        deleteButton =
            `<button data-bs-toggle='modal' data-bs-target='#deletePostModal' data-id='${postData._id}'>
                <i class='fa-solid fa-trash'></i>
            </button>`
    
    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
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
                                <span class='toUnderline'>
                                    <a href='/profile/${postData.postedBy.username}' class='displayName'>${postData.postedBy.firstName} ${postData.postedBy.lastName}</a>
                                    <a href='/profile/${postData.postedBy.username}' class='username'>@${postData.postedBy.username}</a>
                                </span>
                                <span class='date'>${timestamp}</span>
                                ${deleteButton}
                            </div>
                            ${replyFlag}
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
                        <div class='postButtonContainer'>
                            <button class='${repostButtonActiveClass} repostButton'>
                                <i class='fa-solid fa-shrimp'></i>
                                <span>${postData.repostUsers.length || ""}</span>
                            </button>
                        </div>
                        <div class='postButtonContainer'>
                            <button class='${likeButtonActiveClass} likeButton'>
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