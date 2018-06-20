module.exports = prefixCheck

async function prefixCheck (context) {
  const {pull_request: pr} = context.payload
  const currentStatus = await getCurrentStatus(context)
  const actions = getPrefixNames()
  const patt = /#[0-9]+-/i
  const match = title => {
    for (var i = 0; i < actions.length; i++) {
      if (title.indexOf(actions[i]) === 0) {
        return true
      }
    }
    return false
  }
  var newStatus
  if (match(pr.title)) {
    newStatus = 'success'
    var text = patt.exec(pr.head.ref)
    if (text!=null&&text.index === 0 && !(pr.title.indexOf(text.toString()) >= 0)) {
      await context.github.pullRequests.update(context.repo({
        number: pr.number,
        title: pr.title + ' close ' + text.toString()
      }))
    }
  } else {
    newStatus = 'error'
  }
  const logLabel = `${pr.html_url} "${pr.title}"`
  if (currentStatus === newStatus) {
    return console.log(`${logLabel} — ${currentStatus} (unchanged)`)
  }
  try {
    await context.github.repos.createStatus(context.repo({
      sha: pr.head.sha,
      state: newStatus,
      target_url: 'https://github.com/apps/wip',
      description: match ? 'ready for review' : 'Invalid Title Prefix',
      context: 'Invalid Title Format'
    }))
    console.log(`${logLabel} — ${newStatus}`)
  } catch (error) {
    console.log(`${logLabel} — ${error}`)
  }
}

function getPrefixNames () {
  const path = require('./package.json')
  const names = Object.assign({
    'prefix': {
      'types': []
    }
  }, path.config)
  return names['prefix'].types
}

async function getCurrentStatus (context) {
  const {data: {statuses}} = await context.github.repos.getCombinedStatusForRef(context.repo({
    ref: context.payload.pull_request.head.sha
  }))

  return (statuses.find(status => status.context === 'Invalid Title Format') || {}).state
}
