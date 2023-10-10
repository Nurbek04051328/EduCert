const {Schema, model} = require('mongoose')

const degree = new Schema({
    userId: String,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Degree', degree)