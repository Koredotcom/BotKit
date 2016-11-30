function ExecutionContext(execCont) {
    this.intent     = execCont.intent;
    this.nextPrompt = execCont.nextPrompt;
}

module.exports = ExecutionContext;
