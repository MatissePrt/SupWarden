cd api && npm i --legacy-peer-deps && cd ../web && npm i --legacy-peer-deps && npm run build && cd .. && docker-compose build && docker-compose up -d
