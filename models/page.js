const {Schema, model} = require('mongoose')

const page = new Schema({
    userId: String,
    title: {
        type: String,
    },
    text: {
        type: String,
    },
    slug: {
        type: String,
        unique: true
    },
    img: {
        type: Array
    },
    language: {
        type:String
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Page', page)