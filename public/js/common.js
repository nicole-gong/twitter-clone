$("#postTextArea").on("keyup", event => {
    var textbox = $(event.target).val().trim()
    var submitButton = $("#submitPostButton")
    if (textbox == "") {
        submitButton.prop("disabled", true)
        return
    }
    submitButton.prop("disabled", false)
})