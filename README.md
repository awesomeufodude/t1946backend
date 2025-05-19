# Touch 1946 `backend`

## Configurar variables de entorno

Crear archivo `.env` que contiene las variables de entorno

```bash
cp .env.example .env
```

Crear archivo `docker-compose.yml` para desplegar contenedor Docker

```bash
cp docker-compose.yml.example docker-compose.yml
```

### Configurar variables de despliegue (opcional)

El puerto por defecto para el contenedor web es el `3001`, si lo requiere, puede cambiarlo en el archivo `.env`

```
SERVER_PORT=[puerto]
```

El puerto por defecto para el forward del contenedor de base de datos es el `5432`, si lo requiere, puede cambiarlo en el archivo `.env`

```
DB_FORWARD_PORT=[puerto]
```

## Ejecutar despliegue para desarrollo

```bash
docker-compose up -d
```

## Acceder a la aplicación

Desde el navegador web ingresar a `http://localhost:[puerto]`

## Añadir githook pre-commit

Crear el archivo `.git/hooks/pre-commit` con el siguiente contenido, en donde `DEV_t1946_back` es el nombre del contenedor:

```bash
#!/bin/sh

docker exec DEV_t1946_back npm run test
TEST_RESULT=$?

docker exec DEV_t1946_back npm run lint
LINT_RESULT=$?

if [ $TEST_RESULT -ne 0 ] || [ $LINT_RESULT -ne 0 ]; then
  echo "Pre-commit checks failed. Please fix the issues before committing."
  exit 1
fi

exit 0
```

### añadir permisos de ejecución al archivo si lo requiere (opcional)

```bash
chmod +x .git/hooks/pre-commit
```

## Migraciones y Seeders

### Crear una nueva migración

```bash
docker exec -it DEV_t1946_back npm run make:migration -d src/infrastructure/database/migrations/Store
```

### Ejecutar migraciones

```bash
docker exec -it DEV_t1946_back npm run migrate:run
```

### Ejecutar Seeders

```bash
docker exec -it DEV_t1946_back npm run seed
```
