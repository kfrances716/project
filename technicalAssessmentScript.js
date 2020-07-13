#!/usr/bin/env node

const axios = require("axios");

const name = (process.argv[2]);
const my_token = 'XXXXXXXX';

var numOfPagesArray = [];
var repoNames = [];
var nameType = '';

var dummyData = {
  'CoffeeScript': 10,
  'Perl': 20,
  'Assembly': 30,
  'Coq': 1,
  'SQLPL': 1,
  'Scala': 17,
  'Cap\'n Proto': 12,
  'TypeScript':200,
  'CMake':100,
  'C': 101,
  'Go': 300
}

/*
* Function to retrieve the first page of a Github API request for list of repos
* for an user as well as determining the number of pages left to retrieve
*/
async function findFirstPageAndCountUser() {
  try {
    var pageData;
    var numOfPages = 1;

    const response = await axios.get(
      `https://api.github.com/users/${name}/repos?page=1&per_page=100`, {
      'headers': {
        'Authorization': `token ${my_token}`
      }
    });

    // Checks to see if a link exists for more pages
    if(response.headers.link) {
      var headersLink = response.headers.link.split(",");
      var start = headersLink[1].indexOf("=") + 1;
      var end = headersLink[1].indexOf("&");
      numOfPages = headersLink[1].substring(start, end);
      pageData = response.data;

      for(var i = 2; i <= numOfPages; i++) {
        numOfPagesArray.push(i);
      }
    }

    //
    else {
      pageData = response.data;
    }

    nameType = "user";
    getRepoNames(pageData);
    return numOfPages;

  } catch(err) {
    return 0;
  }
}

/*
* Function to retrieve the first page of a Github API request for list of repos
* for an org as well as determining the number of pages left to retrieve
*/
async function findFirstPageAndCountOrg() {
  const pageNumber = 1;
  try {
    var pageData;
    var numOfPages = 1;

    const response = await axios.get(`https://api.github.com/orgs/${name}/repos?page=1&per_page=100`, {
      'headers': {
        'Authorization': `token ${my_token}`
      }
    });

    // Checks to see if a link exists for more pages
    if(response.headers.link) {
      var headersLink = response.headers.link.split(",");
      var start = headersLink[1].indexOf("=") + 1;
      var end = headersLink[1].indexOf(">");
      numOfPages = headersLink[1].substring(start, end);
      pageData = response.data;

      for(var i = 2; i <= numOfPages; i++) {
        numOfPagesArray.push(i);
      }
    } else {
      pageData = response.data;
    }

    nameType = "user";
    getRepoNames(pageData);
    return numOfPages;

  } catch(err) {
    return 0;
  }
}

// Parses the name of repos from response data
function getRepoNames(currentPageData) {
  Array.prototype.forEach.call(currentPageData, repoData => {
    repoNames.push(repoData.name);
  });
}

// Retrieves remaining list of repos across pages
async function getPageData() {
  var count = 0;

  // Endpoint for users
  if(nameType === 'user') {
    const response = await Promise.all(numOfPagesArray.map(pageNumber =>
      axios.get(`https://api.github.com/users/${name}/repos?page=${pageNumber}&per_page=100`, {
      'headers': {
        'Authorization': `token ${my_token}`
      }
    })
      .then(pageResponse => {
        getRepoNames(pageResponse.data);
      })
    ));
  }
  // Endpoint for orgs
  else {
    const response = await Promise.all(numOfPagesArray.map(pageNumber =>
      axios.get(`https://api.github.com/orgs/${name}/repos?page=${pageNumber}`, {
      'headers': {
        'Authorization': `token ${my_token}`
      }
    })
      .then(pageResponse => {
        getRepoNames(pageResponse.data);
      })
    ));
  }
}

// Retrieves languages from each repo listed in array of Repo Names and assigns
// frequency of each language into an object
async function getLanguages() {
  var languages = {};
  var repoLanguages = [];

  const response = await Promise.all(repoNames.map(repoName => axios.get(`https://api.github.com/repos/${name}/${repoName}/languages`, {
    'headers': {
      'Authorization': `token ${my_token}`
    }
  })
    .then(returnedValue => {
      var languagesInRepo = Object.keys(returnedValue.data);
      languagesInRepo.forEach(languageUsed => {
        languageUsed = languageUsed.toString();
        if(languageUsed) {
          if(languages[languageUsed]) {
            languages[languageUsed] = languages[languageUsed] + 1;
          } else {
            languages[languageUsed] = 1;
          }
        }
      })
    })
  ));

  return languages;
}

// Main method to organize function calls
async function main() {
  var values;
  if(name === "dummyData") {
    values = dummyData;
  } else {
    var numOfPages = await findFirstPageAndCountUser();

    if(numOfPages === 0) {
      numOfPages = await findFirstPageAndCountOrg();
      if(numOfPages === 0) {
        console.error("Name was not found");
        return;
      }
    }
    if(numOfPages > 1) {
      await getPageData();
    }

    values = await getLanguages();
  }

  var sorter = Object.keys(values);

  sorter.sort(function(a, b) {
    return  values[b] - values[a]
  });

  for (const [key, value] of Object.entries(sorter)) {
    console.log(`${value}, ${values[value]}`)
  }
}

main().then(() => {
  process.exit(0);
}, (err) => {
  console.error("Error occured during processing. Verify name and wait before trying again");
  process.exit(1);
});
