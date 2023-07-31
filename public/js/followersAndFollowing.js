$(document).ready(() => {
    if (selectedTab === 'followers')
        loadFollowers()
    else
        loadFollowing()
})

function loadFollowers() {
    $.get(`/api/users/${profileUserID}/followers`, results => {
        outputUsers(results.followers, $('.resultsContainer'))
    })
}
function loadFollowing() {
    $.get(`/api/users/${profileUserID}/following`, results => {
        outputUsers(results.following, $('.resultsContainer'))
    })
}

function outputUsers(results, container) {
    container.html('')
    results.forEach(result => {
        var html = createUserHTML(result, true)
        container.append(html)
    })

    if (results.length == 0)
        container.append("<span class='emptyPost'>No results here.</span>")
}

function createUserHTML(userData, showFollowButton) {
    var name = userData.firstName + ' ' + userData.lastName
    
    var followButton = ''
    var isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id)
    var text = isFollowing ? 'Unfollow' : 'Follow'
    var buttonClass = isFollowing ? 'followButton following' : 'followButton'
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>${text}</button>
                        </div>`
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'></img>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.username}'>${name}</a>
                        <span class=username>@${userData.username}</span>
                    </div>
                    ${followButton}
                </div>
            </div>`
}