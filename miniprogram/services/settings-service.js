const store = require('../store/app-store')
function get() { return { user: store.getUser(), settings: store.getSettings() } }
function setMode(mode) { const user = { ...store.getUser(), mode }; store.saveUser(user); return user }
function updateSettings(patch) { const settings = { ...store.getSettings(), ...patch }; store.saveSettings(settings); return settings }
module.exports = { get, setMode, updateSettings }
