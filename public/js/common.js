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
    var textbox = { content: $('#postTextArea').val() }
    $.post("/api/posts", textbox, postData => {
        var html = createPostHTML(postData)
        $(".postsContainer").prepend(html)
        $('#postTextArea').val('')
        button.prop("disabled", true)
    })
})

function createPostHTML(postData) {
    var postedBy = postData.postedBy
    var displayName = postedBy.firstName + " " + postedBy.lastName
    var timestamp = '4/13'
    return `<div class='post'>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'></img>
                    </div>
                    <div class='postContentContainer'>
                        <div class='postHeader'>
                            <a href='/profile/${postedBy.username}'>${displayName}</a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='username'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                        </div>
                    </div>
                </div>
            </div>`
}