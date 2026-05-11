FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/static.conf /etc/nginx/conf.d/default.conf
COPY _site/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
