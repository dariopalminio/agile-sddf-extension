# Organizar las especificaciones vivas con Gherkin

Las especificaciones ejecutables viven en `specs/features/`. Organiza sus archivos según el comportamiento que una persona busca en la biblioteca.

## Organización

### Estructura organizativa de features (Living spec)

```text
specs/features/
└── <domain-name>/
    └── <capability-name>/
        └── <feature-name>.feature
```

- **Dominio.** Área funcional del producto, como la entrada de datos.
- **Capacidad.** Resultado que agrupa comportamientos afines, como introducir valores.
- **Feature.** Archivo Gherkin que describe un comportamiento y reúne sus escenarios, incluidas sus variantes y errores.

#### Ejemplo del repositorio

__SPECS_FEATURES_ROOT-FOLDER__: `specs/features/`

Ejemplo de librería de componentes UI:

```text
__SPECS_FEATURES_ROOT-FOLDER__
└── data-entry/
    ├── enter-values/
    │   ├── number-input.feature
    │   └── textarea.feature
    └── choose-options/
        └── select.feature
```

Ejemplo de librería de comercio electrónico:

```text
__SPECS_FEATURES_ROOT-FOLDER__
├── compras/                           # domain
│   ├── gestionar-pedidos/             # capability
│   │   ├── confirmar-pedido.feature
│   │   ├── consultar-estado.feature
│   │   └── cancelar-pedido.feature
│   └── gestionar-carrito/             # capability
│       └── actualizar-carrito.feature
└── pagos/                             # domain
    ├── procesar-pagos/                # capability
    │   └── pagar-pedido.feature
    └── gestionar-reembolsos/          # capability
        └── reembolsar-pago.feature
```

