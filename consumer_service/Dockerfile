FROM node:10-alpine AS build-env

WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn

COPY src/ src/
COPY test/ test/
COPY tsconfig* jest.config.js tslint.json ./
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline

FROM gcr.io/distroless/nodejs:debug

ARG NAME
ARG DESCRIPTION
ARG VERSION
ARG COMMIT_SHA
ARG BUILD_TIMESTAMP
ARG VCS_URL

LABEL org.opencontainers.image.created="$BUILD_TIMESTAMP"
LABEL org.opencontainers.image.title="$NAME"
LABEL org.opencontainers.image.description="$DESCRIPTION"
LABEL org.opencontainers.image.source="$VCS_URL"
LABEL org.opencontainers.image.revision="$COMMIT_SHA"
LABEL org.opencontainers.image.version=$VERSION

LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.docker.cmd="docker run --rm=true -ti --init -p 3000:3000 boilerplate-service"

WORKDIR /app
COPY --from=build-env /build/dist ./dist
COPY --from=build-env /build/package.json ./
COPY --from=build-env /build/node_modules ./node_modules

CMD ["dist/main.js"]
