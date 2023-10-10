const {Schema, model} = require('mongoose')

const  mentor = new Schema({
    userId: String,
    user: {
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    specialty: {
        type:Schema.Types.ObjectId,
        ref:'Specialty'
    },
    phone: {
        type: String,
        required: [true, "Заполните номер телефона"],
    },
    telegram: {
        type: String,
    },
    avatar: {
        type: Array,
    },
    createdAt: Date,
    updatedAt: Date,
    status: {
        type: Number,
        default: 1
    }
})


module.exports = model('Mentor', mentor)