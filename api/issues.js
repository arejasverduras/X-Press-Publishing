const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const iR = issuesRouter;
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || ('./database.sqlite'));

iR.param('issueId', (req, res, next, issueId) => {
    db.get('SELECT * FROM Issue WHERE id = $issueId', {
        $issueId: issueId
    }, (error, issue)=>{
        if (error){
            next(error);
        } else {
            if (issue){
                next();
            } else {
                res.sendStatus(404);
            }
        }
    })
});

iR.get('/', (req, res, next) => {
    
    db.all('SELECT * FROM Issue WHERE Issue.series_id = $seriesId', {
        $seriesId: req.params.seriesId
    }, (error, issues) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({issues: issues})
        }
    })
})

iR.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    if (!name || !issueNumber || !publicationDate || !artistId) {
        res.sendStatus(400);
    } else {
        //return a 400 if artist with provided artistId does not exists
        db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
            $artistId: artistId
        }, (error, artist) => {
if (error) {
    next(error);
} else {
    if (!artist) {
        res.sendStatus(400);
    } else {
        //query for the actual post INSERT INTO
        db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $isno, $date, $artist_id, $series_id)', {
            $name: name,
            $isno: issueNumber,
            $date: publicationDate,
            $artist_id: artistId,
            $series_id: req.params.seriesId 
        }, function (error) {
            if (error) {
                next (error);
            } else {
                db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (error, issue) =>{
                    if (error) {
                        next(error);
                    } else {
                    res.status(201).json({issue: issue});
                    }
                })
            }
        })
    }
}
        })
    }
})



iR.put('/:issueId', (req, res, next) =>{
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    

    if (!name || !issueNumber || !publicationDate || !artistId) {
        res.sendStatus(400);
    } else {
       
        db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
            $artistId: artistId
    }, (error, artist) => {
            if (error){
                next(error);
            } else { 
                if (!artist) {
                res.sendStatus(400);
            } else {
                db.run('UPDATE Issue SET name = $name, issue_number = $isno, publication_date = $date, artist_id = $artistId WHERE id = $issueId', {
                    $name: name,
                    $isno: issueNumber,
                    $date: publicationDate,
                    $artistId: artistId,
                    $issueId: req.params.issueId    
                }, (error) => {
                    if (error) {
                        next(error);
                    } else {
                        db.get('SELECT * FROM Issue WHERE Issue.id = $issueId', {
                            $issueId: req.params.issueId
                        }, function (error, issue) {
                            if (error){
                                next(error)
                            } else {
                                res.status(200).json({issue: issue});
                            }
                        })
                    }
                }
                )
            }
        }
        })



        
    }

});

iR.delete('/:issueId', (req, res, next) => {
    db.run('DELETE FROM Issue WHERE Issue.id = $issueId', {
        $issueId : req.params.issueId
    }, (error) => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    })
});

module.exports = iR;