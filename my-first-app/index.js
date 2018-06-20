var JaroWinkler=require("./JaroWinkler.js")
var prefixCheck=require("./prefix-check.js")
var nodemailer = require('nodemailer');

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  app.on(['pull_request.opened', 'pull_request.edited'], prefixCheck)
  app.on('issues.opened', async context => {
  	/*Authentication*/
  	const github = await app.auth(context.payload.installation.id);
  	/*Getting all issues*/
  	const allIssues = await github.paginate(github.issues.getForRepo(context.repo()), issues => issues);
  	/*Getting other issues*/
  	const otherIssues = allIssues[0].data.filter(issue => issue.number !== context.issue().number);
  	/*The issue opened*/
  	const theIssue = allIssues[0].data.find(issue => issue.number === context.issue().number);
  	/*Similar Score*/
  	var similarScore=0;
  	/*Similar issue result*/
  	var result;
  	/*Find out the issue that has the highest similar score*/
  	for(var i=0;i<otherIssues.length;i++){
  		if(JaroWinkler.Distance(theIssue.body,otherIssues[i].body )>similarScore){
  			result=otherIssues[i];
  			similarScore=JaroWinkler.Distance(theIssue.body,otherIssues[i].body )
  		}
  	}

  	
  	if(similarScore>0.4&&result!==undefined){
  		/*Comment Parameter*/
  		const params = context.issue({body: 'Likely similar to #'+result.number})

  		/*Email Function*/
  		const user=await github.users.getForUser({username:context.payload.issue.user.login})
	   	var transporter = nodemailer.createTransport({
		  service: 'gmail',
		  auth: {
		    user: 'issuehunter18@gmail.com',
		    pass: 'Hunter2018'
		  }
		});
		var mailOptions = {
		  from: 'issuehunter18@gmail.com',
		  to:'shengzhizhou1996@gmail.com' ,//user.data.email,
		  subject: 'Similar issue to:',
		  text: 'Duplicate issue'+result.html_url
		};
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  }
		});

		/*Review Similar Issue*/
		reviewSimilarIssue(result,context,theIssue);

		/*Create Comment*/
	   	return context.github.issues.createComment(params)+context.github.issues.addLabels(context.issue({labels:["likelyduplicate"]}))
  	
  	}
  	
  });
  function reviewSimilarIssue(result,resultContext,theIssue){
  	app.on('issue_comment.created',async context=>{
  		if(result.state!="closed"&&context.payload.comment.body=="+1"&&result.number==context.payload.issue.number&&context.payload.issue.user.login==result.user.login){
  			const { issue, comment, repository } = resultContext.payload
		    const issueCopy = {
		      'owner': repository.owner.login,
		      'repo': repository.name,
		      'number':issue.number,
		      'state':'closed'
		    }
  			return resultContext.github.issues.createComment(resultContext.issue({body: 'This issue will be closed'}))
  			+resultContext.github.issues.addLabels(resultContext.issue({labels:["duplicate"]}))
  			+resultContext.github.issues.edit(issueCopy)
  		}
  	});
  }
}
