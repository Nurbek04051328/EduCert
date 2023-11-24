const {Schema, model} = require('mongoose')

const lesson = new Schema({
    userId: String,
    chapterId: {
        type: Schema.Types.ObjectId,
        ref: 'Chapter',
    },
    type: {
        type: String,
    },
    title: {
        type: String,
    },
    text: String,
    link:String,
    file: Array,
    time: Number,
    ordNumber:Number,
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Lesson', lesson)