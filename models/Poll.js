const mongoose = require('mongoose');

const pollSchema = mongoose.Schema({
  question: {
    type: String,
    required: true
   },
  description: {
    type: String,
    required: true
   },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }]
});

pollSchema.methods.totalVotes = function() {
  return this.options.reduce(( sum, o ) => sum + o.votes, 0 );
}

pollSchema.methods.truncateDescription = function() {
  if ( this.description && this.description.length > 150 ) {
    return this.description.substring( 0, 70 ) + ' ...';
  }
  return this.description;
};

module.exports = mongoose.model( 'Poll', pollSchema );;
