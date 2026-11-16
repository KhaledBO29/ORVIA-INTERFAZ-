# Ramas y pull requests para un solo integrante

`main` conserva su publicación parcial, `develop` reúne el frontend y las ramas `feature/NN-nombre` forman una cadena continua de componentes. Cada feature nueva parte de la última feature integrada y tiene su propio commit de implementación. Los componentes reutilizables van primero, las pantallas después y el ensamblaje al final.

El merge de cada PR agrega además un commit de integración. Ese commit de merge no es otro cambio del componente: conserva la separación visual de las ramas como en la captura de referencia. No uses squash ni rebase si quieres mantener ese gráfico. Las features se conservan tras integrarlas.

```text
main      ● publicación
          │ ╲
develop   │  ●──────●──────●──────●
          │   ╲    │╲     │╲     │
features  │    ●───┴─●────┴─●────┴─●
          └────┴─────────────────── base común
```

El orden completo y los enlaces se encuentran en [ENTREGAS.md](ENTREGAS.md). Los archivos `docs/pr/NN-*.md` guardan el texto de cada PR dentro de la propia entrega.

## Trabajar tu siguiente componente

```powershell
git switch develop
git pull --ff-only origin develop
# Continúa la línea desde la última feature que ya se integró.
git switch -c feature/29-mi-componente origin/feature/28-prueba-persistencia
npx ng generate component shared/mi-componente --skip-tests
```

Implementa la pieza, impórtala desde el padre correspondiente y comprueba la aplicación.

```powershell
npm run build
npm test
git add src/app/shared/mi-componente
# Agrega también los archivos del padre que hayas cambiado.
git commit -m "Feat:Crear mi componente"
git push -u origin feature/29-mi-componente
```

Abre un PR en GitHub con **base: develop** y **compare: feature/29-mi-componente**. La plantilla aparece automáticamente. Usa el nombre real del componente en el título, describe cada archivo y registra la validación que sí ejecutaste. Las secciones Bug y Hotfix dicen “No aplica” si es una función nueva.

Comprueba Files changed y los checks. Como trabajas solo, no inventes la aprobación de otro integrante. Si las reglas permiten integrar tu PR, elige **Create a merge commit**. Después:

```powershell
git switch develop
git pull --ff-only origin develop
git log --graph --oneline --decorate --all
```

Puedes ver este gráfico en Git Graph para VS Code o en el cliente Git que prefieras. Las features llevan números para que su secuencia también sea visible al ordenarlas por nombre.

## Cómo estudiar una entrega sin alterar develop

```powershell
git show feature/03-tarjeta-indicador --stat
git show feature/03-tarjeta-indicador:src/app/shared/stat-card/stat-card.ts
git diff feature/03-tarjeta-indicador^ feature/03-tarjeta-indicador
```

El primer comando resume archivos, el segundo abre una versión histórica y el tercero muestra exactamente el commit de implementación. No uses `develop..feature/...` para medir una feature ya integrada: develop ya contiene ese cambio y entregas posteriores.

## Llevar una versión a main

La integración del frontend queda en develop. Main conserva la publicación parcial que ya existía. Para publicar una entrega estable posterior, abre un PR `develop → main`, revisa los cambios y valida antes de integrarlo.

## Gráfico continuo y colores

El 16 de noviembre de 2026 se reorganizaron los padres de los commits publicados para mantener continuas las líneas de las features y develop. Se mantuvo la publicación parcial de main. Se verificó que los árboles de archivos de las 26 features, sus 26 integraciones y main fueran idénticos a los originales. Los mensajes y cambios por componente se conservaron; los hashes cambiaron. Los PR históricos conservan en GitHub sus commits originales.

El respaldo completo anterior a la reorganización está fuera del repositorio: `../ORVIA-historial-original-20261116.bundle`. Puede inspeccionarse sin alterar este proyecto mediante `git clone ../ORVIA-historial-original-20261116.bundle ../orvia-historial-original`.

`.vscode/settings.json` configura Git Graph con cian, verde y rosado, curvas suaves y orden por fecha. Los colores corresponden a los carriles que dibuja el visor; Git no almacena un color como propiedad de una rama. Las conexiones entre carriles representan integraciones reales. Main tiene menos recorrido porque su publicación es parcial.

Abre Git Graph, muestra todas las ramas y pulsa Refresh. Si había un orden personalizado en ese repositorio, selecciona Commit Order → Date Order desde el menú del encabezado para aplicar el orden configurado. Conserva las features integradas y crea la siguiente desde la última feature, como en el ejemplo anterior, para prolongar el carril.
