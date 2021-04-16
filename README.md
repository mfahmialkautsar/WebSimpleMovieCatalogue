# MovieCatalogue-LIFF
Basically the same as my android [The Movie Catalogue](https://github.com/mfahmialkautsar/TheMovieCatalogue), but you can run this on any browser you have on your phone and computer.
And if you login with your [LINE Messenger](https://line.me) account, you can get Watchlist feature. This can be happened with the help of LIFF ([LINE Front-end Framework](https://developers.line.biz/console)).

Just a try and error app. No framework. Clean Node.js and some small packages only.

## Screenshot
<img src="./screenshots/computer_films.png" title="Films (Computer)">&nbsp;
<img src="./screenshots/computer_detail.png" title="Detail (Computer)">
<img src="./screenshots/phone_home.jpg" width="256" title="Home (Phone)">
<img src="./screenshots/phone_detail.jpg" width="256" title="Detail (Phone)">

### App Features
* [x] Discover Movies & TV Series Information
* [x] Movies & TV Series Search
* [x] Watchlist
* [x] LINE Front-end Framework Integration

### Sample
https://liff.line.me/1653723806-zZml2obV (or you can access https://liffmovie.herokuapp.com)

### Configuration
- Run `npm i`
- `DATABASE_URL` at `db.js`: PostgreSQL database url
- `MOVIE_DB_API` at `web.js`: Your TMDB API key
- `LIFF_ID` at `web.js`: From LINE Developers
- Endpoint URL at LIFF LINE Developers: Your domain

### Technologies
- [TMDB](https://developers.themoviedb.org/3)
- [LINE Front-end Framework SDK](https://developers.line.biz/en/docs/liff/)
- [Node.js](https://nodejs.org/en/docs/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Bootstrap](https://getbootstrap.com/docs/4.3/getting-started/introduction)
- [Font Awesome](https://github.com/FortAwesome/Font-Awesome)
 
## Author
* **Fahmi Al**