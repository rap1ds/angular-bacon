
/*
 * GET users listing.
 */

var color = {
  r: 200,
  g: 200,
  b: 200
};

exports.save = function(req, res){
  if(req.body.r === 123) {
    // This is just for testing
    res.send(500);
    return;
  }

  color = req.body;
  res.send(200);
};

exports.load = function(req, res){
  res.json(color);
};