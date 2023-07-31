# Major Revamps
- [ ] in the home page, add separate "for you" and "following" tabs
    - gives user option to only view posts from those they follow 

# Site Bugs
- [X] deleting a post with reposts will destroy the site
    - because the reposts are trying to load deleted posts
- [ ] some properties in payload for SOME nonexistent users just dont exist, which breaks things.
    - idk how i fixed this. i didn't even change anything. then it broke again
    - has to do with catch errors in findByID(), since async function behavior is different
    - and perhaps cached data as well
- [ ] recursively load all replies to posts
    - replies are hard-coded to only load the top and bottom reply currently
    - because schema population is done manually per-case rn 
- [ ] reposts display only the logged-in user as the one who reposted 

# Visual Bugs
- [ ] get rid of horizontal scrollbar on screens
    - [X] for medium and large screens
    - [ ] for small screens
- [X] sticky, detailed navbar
- [ ] fix timestamps
    - [ ] show original post's time, not time of retweet
    - [ ] better display on medium / small screens
- [ ] change comment button style to be white with no replies, pink with replies

# Code Maintenance
- [ ] refactor the .catch() code to take up less space per instance 
    - give more informative console information
- [ ] make sure all async functions have exception handling