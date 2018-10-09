
/**
*
*Search for a suitable recommender.
*
*@param {string} id - Recommender's id. If null then a suitable recommender will be returned
*@param {function} cb - The function to be executed at the end. Will carry error if is the case
*
*
*/
module.exports = selectRecommender = function(id,cb){
  if(id){
    User.findOne(id).exec(cb);
  }else{
    User.find({defaultRecommender:true},(err,users)=>{
      if(err)return cb(err);
      if(users.length===0)return({message:'user_pool_empty'});
      var ordered=users.sort((a,b)=>{
        return Object.keys(a.recommended).length - Object.keys(b.recommended).length;
      });

      return cb(null,ordered[0]);
    });
  }
};
