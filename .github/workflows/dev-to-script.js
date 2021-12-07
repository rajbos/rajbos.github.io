module.exports = ({devtoToken, axios}) => {
  console.log(`devtoToken: ${devtoToken}`);

  const instance = axios.create({
    baseURL: 'https://dev.to/api',
    timeout: 1000,
    headers: {'api-key': `${devtoToken}`},
  });

  instance.get('/articles/me/unpublished')
  .then(function (response) {    
    handleUnpublished(response.data);    
  })

  function handleUnpublished(data) {
      console.log(`Unpublished articles: ${data.length}`);
      let filtered = data.filter(article => {
        if (article.title.toLowerCase().indexOf('github') > -1) {
          return true;
        }
        return false;
      })

      console.log(`Filtered articles: ${filtered.length}`);
      filtered.forEach(element => {
          console.log(`Found article: [${element.title}]`)

          // update the article to published
          instance.put(`/articles/${element.id}`, {
              article: 
                { published: true }
        })
      });
  }
}