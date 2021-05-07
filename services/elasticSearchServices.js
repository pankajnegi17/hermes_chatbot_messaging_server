var elasticsearch = require("elasticsearch");

var elasticClient = new elasticsearch.Client({
  host: "http://elastic:TBmHoskuQlBzlX78hOZo@13.71.124.200:9200",
  log: "info",
});



// var elasticClient = new elasticsearch.Client({
//   host: "http://elastic:XyGjOdRwJbgyOorB2UR0@localhost:9200",
//   log: "info" 
// });

var indexName = "as_hermes_gunung_fp";

/**
 * Delete an existing index
 */
function deleteIndex() {
  return elasticClient.indices.delete({
    index: indexName,
  });
}
exports.deleteIndex = deleteIndex;

/**
 * create the index
 */
function initIndex() {
  return elasticClient.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          question: { type: "text" },
          context: { type: "text" },
        },
      },
    },
  });
}
exports.initIndex = initIndex;

/**
 * check if the index exists
 */
function indexExists() {
  return elasticClient.indices.exists({
    index: indexName,
  });
}

exports.indexExists = indexExists;

function initMapping() {
  return elasticClient.indices.putMapping({
    index: indexName,
    body: {
      properties: {
        title: { type: "string" },
        content: { type: "string" },
        suggest: {
          type: "completion",
          analyzer: "simple",
          search_analyzer: "simple",
          payloads: true,
        },
      },
    },
  });
}
exports.initMapping = initMapping;

function addDocument(document) { 
  return elasticClient.index({
    index: indexName,
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: document.body,
  });
}
exports.addDocument = addDocument;

function addBulkDocuments(dataset){
  const body = dataset.flatMap(doc => [{ index: { _index: indexName } }, doc])
return  elasticClient.bulk({ refresh: true, body })
}
exports.addBulkDocuments = addBulkDocuments


function getSuggestions(input, domain, user_type) {
  let index = ""
  if(user_type == "admin"){
    index = domain == "hr_pro" ? "as_hermes_gunung_hp_admin" : "as_hermes_gunung_fp_admin"
  }
  else{
    index = domain == "hr_pro" ? "as_hermes_gunung_hp" : "as_hermes_gunung_fp"
  } 
  return elasticClient.search({
    index: index,
    body: {   
       size: 5,
      query: {
        match: { question: input },
      },
    },
  });
}
exports.getSuggestions = getSuggestions;

function getMSuggestions(input, domain = "hr_pro") {
  return elasticClient.msearch({
    body: [
      {
        index:  domain == "hr_pro"  ? "as_hermes_gunung_hp_admin" : "as_hermes_gunung_fp_admin",
      },
      {   query: { match: { question: input }}, size: 5},

      {
        index:
          domain == "hr_pro" ? "as_hermes_gunung_hp" : "as_hermes_gunung_fp",
      },
      {   query: { match: { question: input } }, size: 5 },
    ],
  });
}
exports.getMSuggestions = getMSuggestions;