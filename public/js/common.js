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
    var text = { content: $('#postTextArea').val() }
    $.post("/api/posts", text, (postData, status, xhr) => {
        alert(postData)
    })
})