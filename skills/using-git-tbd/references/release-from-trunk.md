# Release directamente desde el tronco (main)

En el desarrollo basado en la rama principal, cada confirmación en la rama principal es publicable. Por lo tanto, es obvio que podemos publicar desde cualquier confirmación. No se usan ramas de release. El release se hace directamente desde main. Esto permite una alta frecuencia de lanzamiento, pero también deja el código base propenso a errores.

```
tag:     v1        v2        v3
main:    --*--------*--------*-------- 
            \      /        /
feature/1:   \----/        /
feature/2:    \-----------/
```

Ideal para: Sitios web, microservicios, APIs, o cualquier sistema donde puedas desplegar varias veces al día.

Filosofía: Cada commit que llega a main es un candidato a producción. No existen ramas de release. El tronco es la release

# Flujo de trabajo típico (Continuous Deployment)

```
main:  1 --- 2 --- 3 --- 4 --- 5 --- 6 --- 7 --- 8 (despliegue automático)
        \         \         \         \
         feat1     feat2     feat3     feat4
          (merged)  (merged)  (merged)  (merged)

Cada commit verde en main → se despliega a producción.
```

# Versionado

Normalmente se usa un sistema referente al commit hash, fecha/hora o un número de build secuencial, no versiones semánticas tradicionales (v1.2.3)

# Fixes en producción

Se aplica una estrategia de “roll‑forward”: el fix se hace en main y se despliega como cualquier otro cambio. No se ramifica para parchear versiones antiguas

## CI/CD

Cada merge a main ejecuta el pipeline completo y, si pasa, se despliega automáticamente a producción.
Requiere un pipeline de CI/CD muy robusto y pruebas automatizadas exhaustivas.
