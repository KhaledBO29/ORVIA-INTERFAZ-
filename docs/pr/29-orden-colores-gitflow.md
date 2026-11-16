<img src="https://ucc.edu.co/PublishingImages/Header/ucc-logo-universidad-cooperativa-de-colombia.svg" width="305" height="77" alt="Universidad Cooperativa de Colombia">

# Ordenar main verde, develop cian y features rosadas

*:bookmark_tabs: Feature*: Orden visual main → develop → features y flujo de integración feature → develop → main.
*:bug: Bug*: Corrige la paleta anterior, que colocaba develop primero.
*:fire: Hotfix*: No aplica

## Desarrollador
- *:construction_worker: Dev*: Khaled Benavides

## Cambios (clases,archivos,etc)
- .vscode/settings.json: verde, cian y rosado en ese orden.
- docs/GIT-Y-PR.md: publicación mediante develop → main, conservación de carriles y siguiente feature.
- README.md: orden visual y dirección de las integraciones.
- docs/pr/29-orden-colores-gitflow.md: descripción de esta entrega.

## Validación
- Sin cambios en código Angular, dependencias ni pruebas.
- La rama continúa desde feature/28-prueba-persistencia.
- Integración primero hacia develop; publicación posterior de develop hacia main mediante otro PR.

## Pantallazos funcionalidades (Opcional)
Consultar el historial en Git Graph con todas las ramas y orden por fecha.
