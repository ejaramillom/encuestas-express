const mongoose = require( 'mongoose' )

const VoteSchema = mongoose.Schema({
  ip: { type: String }
})

const ChoiceSchema = mongoose.Schema({
  text: { type: String },
	votes: [ VoteSchema ]
})

const PollSchema = mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	question: { type: String, required: true },
	description: { type: String, required: true },
	choices: [ ChoiceSchema ]
})

PollSchema.methods.truncateBody = function() {
  if (this.body && this.body.length > 150) {
    return this.body.substring(0, 70) + ' ...';
  }
  return this.body;
};

module.exports = mongoose.model( 'Poll', PollSchema );
