const {Schema, model} = require('mongoose')

const qa = new Schema({
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
    ordNumber:Number,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }

})


module.exports = model('Qa', qa)