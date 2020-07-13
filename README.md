# project
Before You Start:

Since this script is run using javascript, you must make sure that you have Node
js installed with v10 as the minimum version.

Setup:

Before using this script, you must first replace the value of my_token with a
Personal access token. This was added so that the user doesn't hit the max
capacity of the rate limiter for unauthenticated Github API requests.

The second step in the setup is to run
`npm install`
to install the necessary packages.

Run Scripts:

(Javascript script)
After the token is set, the user only needs to run
`node technicalAssessmentScript.js <name>`

ex.
`node technicalAssessmentScript.js awslabs`

(Bash script)
After the token is set, the user only needs to Run
`./bashScript.sh <name>`

ex.
`./bashScript.sh awslabs`

Expected Output:
 The output will consist of the frequency of languages used throughout the repos
of an user or an organization.

Optional:
I have included dummyData that can be used if the max amount on the rate limiter
has been reached. Run:
`node technicalAssessmentScript.js dummyData` for javascript.
`./bashScript.sh dummyData` for bash script.

Design Decisions Made:
Since it is unknown if the name inputted is a user or an organization, the code
has to check both endpoints to confirm if the name exists in Github. Since user
would most likely be more common, GET /users/:username/repos route is checked
first in the findFirstPageAndCountUser function. If that route fails, then it
will try the findFirstPageAndCountOrg function before ending the program.

I increased the size of the response data from the Github API requests to 100.
This was implemented to reduce the number of API calls to speed up performance
as well as to keep the number of requests under the rate limiting set by the
Github API.

Since Links are embedded in the response data along with the first page of the
list of repos, the code handles parsing the number of pages as well as the
repo names. This allows faster performance by reducing the number of API calls.  

TradeOffs:
I picked javascript because of my familiarity with it and because I wanted to
complete this assessment in a timely manner. Another language like Python would
be able to use threading to process the data and handle the requests faster.
My code is unable to since javascript is single threaded and async/await causes
a slower performance in this use case.
