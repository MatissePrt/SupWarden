const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrousseauSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    invitations: [{
        email: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: 'pending'
        }
    }]
});

module.exports = mongoose.model('Trousseau', TrousseauSchema);
