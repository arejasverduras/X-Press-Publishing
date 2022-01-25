const express = require('express');
const sqlite3 = require('sqlite3');
const artistsRouter = express.Router();
const aR = artistsRouter;


const db = new sqlite3.Database(process.env.TEST_DATABASE || ('./database.sqlite'));

aR.get('/', (req,res,next) => {
db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err,artists) => {
if (err) {
    next(err);
} else {
    res.status(200).json({artists: artists});
}
})

});

aR.post('/', (req,res,next)=>{
    if (!req.body.artist.name || !req.body.artist.dateOfBirth || !req.body.artist.biography) {
        return res.sendStatus(400);
    } else {
        if (!req.body.artist.isCurrentlyEmployed){
            req.body.artist.isCurrentlyEmployed = 1;
        }
        
db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dob, $bio, $emp)', {
    $name : req.body.artist.name,
    $dob: req.body.artist.dateOfBirth,
    $bio: req.body.artist.biography,
    $emp: req.body.artist.isCurrentlyEmployed
}, function (error) {
    if (error) {
        next(error);
    } else {
        
        db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (error, artist)=>{
            
                res.status(201).json({artist: artist});
            
            
        })
    }
}

)
    }
});

aR.param('artistId', (req, res, next, artistId) =>{
db.get('SELECT * FROM Artist WHERE id = $artistId', {
    $artistId : artistId
}, (error, artist) => {
if (error) {
    next (error);
} else {
    if(artist){
        req.artist = artist;
        next();
    } else {
        res.sendStatus(404);
    }
}
})
} )

aR.get('/:artistId', (req, res, next)=>{
    res.status(200).json({artist: req.artist})
});

aR.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dob = req.body.artist.dateOfBirth;
    const bio = req.body.artist.biography;
    const emp = req.body.artist.isCurrentlyEmployed;
    const id = req.params.artistId

    if (!name || !dob || !bio || !emp){
        return res.sendStatus(400);
    } else {
const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dob, biography = $bio, is_currently_employed = $emp WHERE id = $id';
      db.run(sql, {
        $id:   id,
        $name: name,
          $dob: dob,
          $bio: bio,
          $emp: emp
      }, function (error, artist) {
          if(error){
              next(error);
          } else {
              db.get(`SELECT * FROM Artist WHERE id = $id`, {
                  $id: id
              }, (error, artist) => {
                  res.status(200).json({artist: artist});
              }

              )
          }
      } 
      )  
    }


})

aR.delete('/:artistId', (req,res,next)=> {
    const id = req.params.artistId;

    const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE id = $id';
db.run(sql, {
    $id: id
}, function (error,artist) {
    if (error) {
        next(error)
    } else {
        db.get(`SELECT * FROM Artist WHERE id = $id`,{
            $id: id
        }, (error,artist)=> {
            res.status(200).json({artist: artist});
        })
        
    }
})

})


module.exports = artistsRouter;