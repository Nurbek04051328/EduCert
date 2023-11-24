const {Schema, model} = require('mongoose')

const test = new Schema({
    userId: String,
    lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
    },
    question: {
        type: String,
    },
    answer: {
        type: String,
    },
    variants: Array,
    ordNumber:Number,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Test', test)