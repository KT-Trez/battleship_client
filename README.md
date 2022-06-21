# Battleship Client

Web client that allows to play [Battleship]((https://en.wikipedia.org/wiki/Battleship_(game))) (also known as Sea
Battle) game. Game's server can be found [here](https://github.com/KT-Trez/battleship_server).

# How to run

1. Install the latest version of Node.js
2. Install dependencies with npm install
3. Build project with `npm run build`

To run game, visit [here](https://github.com/KT-Trez/battleship_server#readme).

# Optional config

You can customize server settings by changing values of the `config` variable in [config file](./src/config.ts).

```js
const config = {
    Menu: {
        // deley for button input in main menu
        TransitionDuration: 200
    },
    // list of default ships for each player
    ShipsList: [
        {
            length: 4,
            quantity: 1
        }
        // ...
    ]
};
```

> Warning  
> Although it is possible to change the default ships' composition, for the time being it's highly not recommended and
> may lead to many errors.
>
> However, if you choose to do so, remember to also edit composition in
> server's [config](https://github.com/KT-Trez/battleship_server#optional-config).

Optional `.env` config.

```dotenv
# origin of game's server, useful when running from Webpack development server
WEB_SERVER_ORIGIN=http://localhost:5000
```

# Scripts

- `npm run build-development` - compiles typescript files in development mode
- `npm run build-production` - compiles typescript files in production mode
- `npm run build-watch` - compiles typescript files in development mode and watches for changes
- ~~`npm run docs` - creates documentation from JSDoc~~ *not ready yet*
- `npm run serve` - compiles typescript files in development mode, watches for changes and runs Webpack development
  server