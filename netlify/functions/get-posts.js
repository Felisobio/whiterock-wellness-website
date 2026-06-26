const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const postsDir = path.join('/var/task', 'posts');
    
    if(!fs.existsSync(postsDir)){
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify([])
      };
    }

    const files = fs.readdirSync(postsDir)
      .filter(function(f){ return f.endsWith('.md'); })
      .reverse();

    var posts = [];

    for(var i = 0; i < files.length; i++){
      var file = files[i];
      var text = fs.readFileSync(path.join(postsDir, file), 'utf8');

      function getField(t, key){
        var start = t.indexOf(key + ':');
        if(start === -1) return '';
        var val = t.substring(start + key.length + 1);
        val = val.split('\n')[0].trim();
        val = val.replace(/^["']/, '').replace(/["']$/, '').trim();
        return val;
      }

      var title = getField(text, 'title');
      var category = getField(text, 'category') || 'Wellness';
      var summary = getField(text, 'summary');
      var parts = text.split('---');
      var body = parts.length >= 3 ? parts.slice(2).join('---').trim() : '';
      var clean = body.split('#').join('').split('*').join('').split('`').join('');
      var excerpt = summary || clean.substring(0, 180).trim() + '...';

      if(!title) continue;
      posts.push({ title: title, category: category, excerpt: excerpt });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(posts)
    };

  } catch(err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify([])
    };
  }
};
