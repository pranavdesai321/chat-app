const generateMessage = (username, message) => {
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
}


const generateUrl = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateUrl
}