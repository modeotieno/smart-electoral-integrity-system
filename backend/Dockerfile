FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o seis .

FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache ca-certificates wget \
  && addgroup -S app && adduser -S app -G app
COPY --from=builder /app/seis .
# Run as non-root
USER app
EXPOSE 8080
# Healthcheck handled by docker-compose
CMD ["./seis"]
