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

PollSchema.methods.truncateDescription = function() {
  if (this.description && this.description.length > 150) {
    return this.description.substring(0, 70) + ' ...';
  }
  return this.description;
};

module.exports = mongoose.model( 'Poll', PollSchema );
