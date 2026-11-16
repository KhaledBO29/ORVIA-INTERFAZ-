<img src="https://ucc.edu.co/PublishingImages/Header/ucc-logo-universidad-cooperativa-de-colombia.svg" width="305" height="77" alt="Universidad Cooperativa de Colombia">

# Esperar la persistencia de TaskFlow antes de recargar en la prueba

*:bookmark_tabs: Feature*: No aplica
*:bug: Bug*: La prueba recargaba inmediatamente después del cambio nativo del checkbox, antes de que el efecto de Angular guardara el nuevo estado.
*:fire: Hotfix*: No aplica

## Desarrollador
- *:construction_worker: Dev*: Khaled Benavides

## Cambios (clases,archivos,etc)
- tests/e2e/orvia.spec.ts: espera el renderizado y el estado persistido antes de recargar; sin pausas de duración fija ni reintentos que oculten el error.
- docs/GIT-Y-PR.md: continúa el ejemplo desde la última feature integrada.
- docs/pr/28-prueba-persistencia.md: documentación de la corrección.

## Validación
- Se verifica el estado Completada antes y después de recargar.
- La aplicación Angular conserva su código y sus recursos.
- La rama continúa la línea de features y el PR apunta a develop.

## Pantallazos funcionalidades (Opcional)
No aplica: corrección de sincronización en una prueba automatizada.
