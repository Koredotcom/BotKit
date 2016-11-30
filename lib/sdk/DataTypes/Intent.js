function Intent(intent) {
    this.id       = intent.id;
    this.name     = intent.name;
    this.entities = intent.entities;
    this.state    = intent.state;
}

module.exports = Intent;
