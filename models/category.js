const {Schema, model} = require('mongoose')

const category = new Schema({
    userId: String,
    icon: {
        type: Array,
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Category', category)