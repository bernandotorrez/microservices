const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const httpStatus = require('http-status');
const { Media } = require('../models/index');
const fs = require('fs');

router.post('/', async function(req, res, next) {
  const image = req.body.image;

  if(!isBase64(image, { mimeRequired: true })) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: 'error',
      message: 'Invalid base64'
    })
  }

  base64Img.img(image, './public/images', Date.now(), async (err, filePath) => {
    if(err) {
      res.status(httpStatus.OK).json({
        status: 'error',
        message: err.message
      })
    } else {

      const filename = filePath.split('/').pop();

      try {
        const media = await Media.create({
          image: filename
        }) 

        res.status(httpStatus.OK).json({
          status: 'success',
          data: {
            id: media.id,
            image: `${req.get('host')}/images/${filename}`
          }
        })
      } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: error.message
        })
      }
    }
  });
});

router.get('/', async (req, res) => {
  const media = await Media.findAll();

  const mappedMedia = media.map((m) => {
    m.image = `${req.get('host')}/images/${m.image}`
    return m;
  })

  res.status(httpStatus.OK).json(mappedMedia)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const media = await Media.findOne({ where: { id: id } });
  
  media.image = `${req.get('host')}/images/${media.image}`

  res.status(httpStatus.OK).json(media)
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const media = await Media.findOne({ where: { id: id } });

  if(!media) {
    res.status(httpStatus.NOT_FOUND).json({
      status: 'not_ound',
      message: 'not found'
    })
  } else {
    fs.unlink(`./public/images/${media.image}`, async (err) => {

      if(err) {
        res.status(httpStatus.OK).json({
          status: 'failed',
          message: err.message
        })
      }

      const deleteMedia = await Media.destroy({ where: { id : id} });

      if(deleteMedia) {
        res.status(httpStatus.OK).json({
          status: 'success',
          message: 'delete images success'
        })
      } else {
        res.status(httpStatus.OK).json({
          status: 'failed',
          message: 'delete images failed'
        })
      }
    });
  }
})

module.exports = router;
