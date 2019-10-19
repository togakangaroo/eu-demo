const proxy = require("http-proxy-middleware")

module.exports = (app) => {
    app.use(
        '/ws',
        proxy({
            target: 'ws://server:8765',
            changeOrigin: true,
        })
    )
}
