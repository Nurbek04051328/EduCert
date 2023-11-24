const {Schema, model} = require('mongoose')

const chapter = new Schema({
    userId: String,
    partId: {
        type: Schema.Types.ObjectId,
        ref: 'Part',
    },
    title: {
        type: String,
    },
    ordNumber:Number,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Chapter', chapter)