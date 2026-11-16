# Ramas y pull requests para un solo integrante

`main` conserva la base original. `develop` reúne el frontend. Cada `feature/NN-nombre` parte del develop actualizado y tiene un commit de implementación. Los componentes reutilizables van primero, las pantallas después y el ensamblaje al final.

El merge de cada PR agrega además un commit de integración. Ese commit de merge no es otro cambio del componente: conserva la separación visual de las ramas como en la captura de referencia. No uses squash ni rebase si quieres mantener ese gráfico. Las features se conservan tras integrarlas.

```text
main     ● base original
         │
develop  ●─────────●─────────●─────────●
          ╲       ╱ ╲       ╱ ╲       ╱
feature    ● Feat:   ● Feat:   ● Feat:
```

El orden completo y los enlaces se encuentran en [ENTREGAS.md](ENTREGAS.md). Los archivos `docs/pr/NN-*.md` guardan el texto de cada PR dentro de la propia entrega.

## Trabajar tu siguiente componente

```powershell
git switch develop
git pull --ff-only origin develop
git switch -c feature/27-mi-componente
npx ng generate component shared/mi-componente --skip-tests
```

Implementa la pieza, impórtala desde el padre correspondiente y comprueba la aplicación.

```powershell
npm run build
npm test
git add src/app/shared/mi-componente
# Agrega también los archivos del padre que hayas cambiado.
git commit -m "Feat:Crear mi componente"
git push -u origin feature/27-mi-componente
```

Abre un PR en GitHub con **base: develop** y **compare: feature/27-mi-componente**. La plantilla aparece automáticamente. Usa el nombre real del componente en el título, describe cada archivo y registra la validación que sí ejecutaste. Las secciones Bug y Hotfix dicen “No aplica” si es una función nueva.

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

La integración del frontend queda en develop. Para una entrega estable futura, abre un PR `develop → main`, revisa los cambios y valida antes de integrarlo. No se ha promovido automáticamente a main ni se ha publicado un sitio externo.
