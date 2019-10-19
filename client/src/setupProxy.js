const proxy = require("http-proxy-middleware")

module.exports = (app) => {
    //TODO - GM - I have no idea why this isn't working, it absolutely should be best as I can tell. Need to circle back
    app.use(`/ws*`, proxy({
        target: 'ws://server:8765',
        changeOrigin: true,
        ws: true,
    }))
}
