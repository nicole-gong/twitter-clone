const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectID },
    pinned: Boolean
}, {
    timestamps: true
})

var Post = mongoose.model('Post', PostSchema)
module.exports = Post