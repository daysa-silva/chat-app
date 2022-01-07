function generateMessage (name, text) {
    return {
        name,
        text,
        createdAt: new Date().getTime()
    }
}

function generateLinkMessage(name, text, link) {
    return {
        name,
        text,
        link,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLinkMessage
}