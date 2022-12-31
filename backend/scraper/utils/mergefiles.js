const fs = require("fs");
const state = require("../state.json");
const deemed = require("../deemed.json");
const central = require("../central.json");
const logger = (message) => console.log("✅ " + message);


function get_merged_results() {
  let merged_results = [];

  Array.prototype.push.apply(merged_results, state.state);
  Array.prototype.push.apply(merged_results, deemed.deemed);
  Array.prototype.push.apply(merged_results, central.central);
  return merged_results;
}

function merge_and_store_results(){
    let merged_results = get_merged_results();
    fs.writeFile(`../merged.json`,JSON.stringify({data:merged_results}),'utf8',()=>{
        logger("SUCCESSFULLY SAVED MERGED FILE THE FILES")
      })
}

merge_and_store_results()

module.exports = {
    merge_and_store_results,
    get_merged_results
}