function Input(input) {
    this.intents  = input.intents;
    this.entities = input.entities;
    this.message  = input.message;
    this.error    = input.error;
}

module.exports = Input;
