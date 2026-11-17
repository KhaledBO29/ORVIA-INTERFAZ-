# ORVIA · Sistema Operativo Empresarial

Frontend educativo en **Angular 21**, TypeScript y SCSS, basado en las 13 pantallas del PDF de referencia. Adaptado a una trituradora de piedra, materiales de construcción y empresas comercializadoras.

![Inicio de ORVIA en escritorio](docs/capturas/dashboard-desktop.png)

ORVIA - Enterprise ERP & Aggregate Operations Operating System
ORVIA es un Sistema de Planificación de Recursos Empresariales (ERP) modular de nivel industrial e institucional, diseñado específicamente para optimizar la gestión integral, logística, contable y operativa de empresas del sector de agregados y construcción (como Construobras Zafiro S.A.S.).


# ORVIA - Sistema de Planificación de Recursos Empresariales y Operaciones de Agregados

## 1. Arquitectura y Estructura de Navegación

El sistema ORVIA mantiene una interfaz estructurada en el panel de navegación lateral bajo el siguiente orden normativo para garantizar el control operativo y contable:

1. Finanzas
2. Ventas
3. Inventario
4. Compras
5. Proveedores
6. Solicitudes
7. Órdenes de compra
8. Recepciones
9. Cuentas por pagar
10. Pagos
11. Reportes
12. TaskFlow
13. Configuración

## 2. Stack Tecnológico

- Backend: Spring Boot (Java 23/24) con arquitectura modular y documentación OpenAPI.
- Base de Datos: PostgreSQL con esquemas optimizados para trazabilidad de inventarios y transacciones financieras.
- Contenedores y Seguridad: Docker con perfiles de ejecución y registros de auditoría forense.
- Facturación Electrónica: Integración nativa con los estándares de la DIAN para emisión y validación automática.

## 3. Componentes Operativos

- Logística de Transporte y Báscula: Control de flotas, volquetas y maquinaria pesada, vinculando el pesaje de báscula directamente con las recepciones y despachos.
- Gestión de Agregados: Trazabilidad volumétrica y por tonelaje de gravas, arenas, triturados y subbases.
- Integración Contable: Transparencia en el impacto de movimientos de inventario y compras sobre los módulos financieros y de cuentas por pagar.

## 4. Despliegue y Configuración

Prerrequisitos:
- Java 23/24 o superior.
- Docker y Docker Compose.
- PostgreSQL configurado en entorno local o servidor dedicado.

Clonación del repositorio:
```bash
git clone [https://github.com/orvia-erp/orvia-enterprise.git](https://github.com/orvia-erp/orvia-enterprise.git)
cd orvia-enterprise
