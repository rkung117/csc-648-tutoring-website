const express = require('express')

function getLazyRegistrationObject(referringPage, data) {
    return {
        referringPage: referringPage,
        data: data
    }
}

function removeLazyRegistrationObject(req, res, callback) {
    delete req.session.lazyRegistration
    callback()
}

module.exports = {
    getLazyRegistrationObject,
    removeLazyRegistrationObject
}