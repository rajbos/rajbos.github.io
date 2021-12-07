module.exports = ({devtoToken, axios}) => {
  console.log(`devtoToken: ${devtoToken}`);

  const instance = axios.create({
    baseURL: 'https://dev.to/api',
    timeout: 1000,
    headers: {'api-key': `${devtoToken}`},
  });

  instance.get('/articles/me/unpublished')
  .then(function (response) {
    // handle success
    console.log(response);
  })
}