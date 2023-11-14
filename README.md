# crypto-hub

## Installation 1/2
```
git clone git@github.com:npldevfr/crypto-hub.git
```

### Docker 2/2
```
cd ./api && cp .env.example .env && cd ..
```

```
docker-compose build
```

```
docker-compose run --rm api pnpm 
docker-compose run --rm nuxt pnpm i
```

```
docker-compose up -d
```
