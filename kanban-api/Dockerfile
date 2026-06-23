FROM php:8.2-alpine

# Install system dependencies for Composer, Git, and SQLite extensions
RUN apk add --no-cache \
    libzip-dev \
    sqlite-dev \
    oniguruma-dev \
    icu-dev \
    linux-headers \
    $PHPIZE_DEPS \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) \
    bcmath \
    intl \
    mbstring \
    pdo_sqlite \
    zip \
  && apk del $PHPIZE_DEPS

# Install Composer (latest stable)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# Copy the rest of the application
COPY . .

# Finish Composer setup (generate optimized autoloader)
RUN composer dump-autoload --optimize

# Ensure writable directories exist for Laravel storage/cache
RUN mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000

# Render expects a long-running process on $PORT, mapped here to 10000
CMD [ "php", "artisan", "serve", "--host=0.0.0.0", "--port=10000" ]
