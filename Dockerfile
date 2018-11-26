FROM starefossen/ruby-node

WORKDIR /app

COPY . /app

RUN npm i

RUN ./node_modules/.bin/bower install

RUN gem install compass

RUN npm i -g npx

RUN npx grunt

FROM nginx:alpine as web
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
