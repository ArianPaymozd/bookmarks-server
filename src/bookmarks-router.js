const express = require('express')
const uuid = require('uuid')
const logger = require('./logger')
const bookmarks = require('./store')

const bookmarkRouter = express.Router()
const bodyparser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post((bodyparser), (req, res) => {
        const {title, url, description="", rating} = req.body
        if (!title) {
            logger.error('Title is required')
            res
                .status(400)
                .send('Title is required')
        }
        if (!url) {
            logger.error('URL is required')
            res
                .status(400)
                .send('URL is required')
        }
        if (!rating) {
            logger.error('Rating is required')
            res
                .status(400)
                .send('Rating is required')
        }
        if (isNaN(rating)) {
            logger.error('Rating value must be a number')
            res
                .status(400)
                .send('Rating value must be a number')
        }
        if(!url.startsWith('https://')) {
            res
                .status(400)
                .send('URL must begin with https://')
        }
        const id = uuid.v4()
        const newBookmark = {
            id,
            title,
            url,
            description,
            rating
        }
        bookmarks.bookmarks.push(newBookmark)
        logger.info(`Bookmark with id ${id} created`)
        res
            .status(201)
            .location('https://localhost/bookmark')
            .json(newBookmark)
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const {id} = req.params
        const target = bookmarks.bookmarks.find(bookmark => bookmark.id === id)
        if (!target) {
            logger.error(`Bookmark with id ${id} not found`)
            return res
                .status(400)
                .send('Bookmark not found')
        }
        res.json(target)
    })
    .delete((req, res) => {
        const {id} = req.params
        const index = bookmarks.bookmarks.findIndex(bookmark => bookmark.id === id)
        if (index === -1) {
            logger.error(`Bookmark with id ${id} not found`)
            return res
                .status (400)
                .send('Bookmark not found')
        }
        bookmarks.bookmarks.splice(index, 1)
        logger.info(`Bookmark with id ${id} deleted`)
        res
            .status(204)
            .end()
    })


module.exports = bookmarkRouter