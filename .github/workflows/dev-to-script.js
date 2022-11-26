module.exports = async ({devtoToken, axios}) => {
  console.log(`devtoToken: ${devtoToken}`);

  const instance = axios.create({
    baseURL: 'https://dev.to/api',
    timeout: 10000,
    headers: {
                'api-key': `${devtoToken}`,
                'Accept': `application/vnd.forem.api-v1+json`,
                'User-Agent': `rajbos`
             },
    responseEncoding: 'utf8'
  });

  instance.get('/articles/me/unpublished')
  .then(async function (response) {
    console.log("API Response:");
    console.log(response);
    console.log('--------------------------------------------------------');
    console.log(response.data);
    console.log('--------------------------------------------------------');
    await handleUnpublished(response.data);
  })

  async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  async function handleUnpublished(data) {
      console.log(`Unpublished articles: ${data.length}`);
      console.log(data);
      let filtered = data.filter(article => {
        if (article.title.toLowerCase().indexOf('github') > -1) {
          return true;
        }
        return false;
      })

      console.log(`Filtered articles: ${filtered.length}`);
      filtered.forEach(element => async function(element) {
          console.log(`Publishing article: [${element.title}]`)
          // replace the `published: false` to `true`
          let updated_markdown = element.body_markdown.replace(/published: false/, "published: true");

          // update the article to published
          instance.put(`/articles/${element.id}`, {
              article:
                {
                    body_markdown: `${updated_markdown}`
                }
        })
        // give the api some time to prevent ratelimiting:
        await sleep(2500);
      });
  }
}
