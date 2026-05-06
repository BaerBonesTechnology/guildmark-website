FROM nginx:1.27-alpine

# Remove the default server config.
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/ /etc/nginx/certs/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
