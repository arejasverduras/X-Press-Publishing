const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const sR = seriesRouter;
const iR = require('./issues');

const db = new sqlite3.Database(process.env.TEST_DATABASE || ('./database.sqlite'));

sR.use('/:seriesId/issues', iR);

sR.get('/', (req, res, next) => {
db.all('SELECT * FROM Series', (error,series) => {
    if (error) {
        next(error);
    } else {
        res.status(200).json({series: series});
    }
})
})

sR.param('seriesId', (req, res, next, seriesId) => {
db.get('SELECT * FROM Series WHERE id = $seriesId', {
    $seriesId: seriesId
}, (error, series) => {
    if (error) {
        next(error);
    } else {
    if (series) {
        req.series = series;
        next();
    } else {
        res.sendStatus(404);
    }}
} )
})

sR.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

sR.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        return res.sendStatus(400);
    } else {
    const values = {
        $name: name,
        $description: description
    };
   

    db.run('INSERT INTO Series (name, description) VALUES ($name, $description)', values, function (error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (error, series) => {
                res.status(201).json({series: series});
            })
        }
            });

    }
});

sR.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    const id = req.params.seriesId;

    if (!name || !description) {
        res.sendStatus(400);
        return;
    } else {
        db.run(`UPDATE Series SET name = $name, description = $description WHERE id = $id`, {
            $name: name,
            $description: description,
            $id: id
        }
     ,function (error) {
            if(error){
                next(error);
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${id}`, function (error, series) {
                    res.status(200).json({series: series});
                })

            }
        })
    }
})

sR.delete('/:seriesId', (req, res, next) => {
    
   
    
   db.get('SELECT * FROM Issue WHERE series_id = $seriesId', {
       $seriesId: req.params.seriesId
   }, (error, series) => {
       if (error) {
           next (error);
       } else {
           if (series){
               res.sendStatus(400);
               
           } else {
            db.run('DELETE FROM Series WHERE id = $seriesId', {
                $seriesId: req.params.seriesId
            }, (error) =>{
                if (error) {
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            })
           }
       }
   })
})

module.exports = seriesRouter;