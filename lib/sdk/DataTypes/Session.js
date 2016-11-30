function Session(session) {
    this.enterpriseContext = session.enterpriseContext;
    this.botContext        = session.botContext;
    this.userContext       = session.userContext;
    this.userSession       = session.userSession;
    this.botUserSession    = session.botUserSession;
}

module.exports = Session;
