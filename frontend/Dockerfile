FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG APP_VERSION=1.0.0
ARG VITE_API_BASE_URL=http://api.terrasense.local/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_VERSION=$APP_VERSION

RUN npm run build

FROM nginx:stable-alpine
ARG APP_VERSION=1.0.0
ENV APP_VERSION=${APP_VERSION}

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

RUN sed -i "s|</head>|<meta name=\"app-version\" content=\"${APP_VERSION}\"></head>|" /usr/share/nginx/html/index.html \
    && printf '%s\n' "${APP_VERSION}" > /usr/share/nginx/html/version.txt

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
