const { app } = require('@azure/functions');

app.http('callback', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'callback',
  handler: async (request, context) => {
    const code = request.query.get('code');

    if (!code) {
      return {
        status: 400,
        body: 'Missing authorization code'
      };
    }

    try {
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return {
          status: 400,
          body: `GitHub OAuth error: ${tokenData.error_description || tokenData.error}`
        };
      }

      const token = tokenData.access_token;

      const script = `
        <!DOCTYPE html>
        <html>
        <body>
        <script>
          (function() {
            function receiveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token: token, provider: 'github' })}',
                e.origin
              );
              window.removeEventListener('message', receiveMessage, false);
            }
            window.addEventListener('message', receiveMessage, false);
            window.opener.postMessage('authorizing:github', '*');
          })();
        </script>
        </body>
        </html>
      `;

      return {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        },
        body: script
      };
    } catch (err) {
      return {
        status: 500,
        body: `Server error: ${err.message}`
      };
    }
  }
});
