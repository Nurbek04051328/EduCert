const {Schema, model} = require('mongoose')

const lesson = new Schema({
    number: Number,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Lesson', lesson)