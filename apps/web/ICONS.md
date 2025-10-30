# Componente Icon - Documentación

Este componente proporciona una forma fácil y consistente de usar iconos de Font Awesome en toda la aplicación.

## Uso Básico

```tsx
import Icon from '../components/Icon';

// Icono simple
<Icon name="box" />

// Con tamaño
<Icon name="wrench" size="2x" />

// Con clase personalizada
<Icon name="warning" className="text-red-500" />

// Con animación
<Icon name="clock" spin />
```

## Iconos Disponibles

### Gestión de Activos
- `box` - Activos/Cajas
- `boxes` - Movimientos/Múltiples activos
- `building` - Edificios/Ubicaciones
- `map-marker` - Ubicación/Marcador

### Acciones
- `plus` - Agregar/Nuevo
- `edit` - Editar
- `trash` - Eliminar
- `eye` - Ver/Visualizar
- `search` - Buscar
- `save` - Guardar
- `check` - Confirmar/Correcto
- `check-circle` - Completado
- `times` - Cancelar/Cerrar
- `times-circle` - Error/Rechazado

### Mantenimiento y Operaciones
- `wrench` - Mantenimiento/Herramientas
- `toolbox` - Caja de herramientas
- `warning` - Advertencia/Incidencia
- `clock` - Tiempo/Pendiente

### Reportes y Análisis
- `chart-bar` - Gráficos/Estadísticas
- `chart-line` - Tendencias
- `clipboard` - Informes/Documentos
- `clipboard-list` - Listas/Asignaciones
- `file` - Archivo
- `file-alt` - Documento

### Usuarios y Permisos
- `user` - Usuario individual
- `users` - Múltiples usuarios
- `sign-out` - Cerrar sesión

### Otros
- `calendar` - Fechas
- `briefcase` - Trabajo/Profesional
- `door` - Entrada/Salida
- `filter` - Filtrar
- `inbox` - Bandeja/Vacío
- `tasks` - Tareas
- `arrow-right` - Flecha derecha
- `arrow-left` - Flecha izquierda
- `download` - Descargar
- `upload` - Subir
- `exchange` - Intercambiar/Transferir

## Props

| Prop | Tipo | Por Defecto | Descripción |
|------|------|-------------|-------------|
| `name` | `string` | (requerido) | Nombre del icono a mostrar |
| `className` | `string` | `''` | Clases CSS adicionales |
| `size` | `'xs' \| 'sm' \| 'lg' \| '1x' \| '2x' \| '3x' \| ...` | `undefined` | Tamaño del icono |
| `fixedWidth` | `boolean` | `false` | Ancho fijo para alineación |
| `spin` | `boolean` | `false` | Animación de rotación |

## Ejemplos de Uso en la Aplicación

### Títulos de Página
```tsx
<h1 className="text-3xl font-bold flex items-center gap-2">
  <Icon name="box" /> Catálogo de Activos
</h1>
```

### Botones
```tsx
<button className="flex items-center gap-2">
  <Icon name="plus" /> Nuevo Activo
</button>
```

### Menú de Navegación
```tsx
<Link className="flex items-center gap-2">
  <Icon name="wrench" /> Mantenimiento
</Link>
```

### Estados
```tsx
{loading ? (
  <Icon name="clock" spin />
) : (
  <Icon name="check-circle" className="text-green-500" />
)}
```

## Agregar Nuevos Iconos

1. Importar el icono en `Icon.tsx`:
```tsx
import { faNewIcon } from '@fortawesome/free-solid-svg-icons';
```

2. Agregar al mapeo:
```tsx
const iconMap: Record<string, IconProp> = {
  // ... iconos existentes
  'new-icon': faNewIcon,
};
```

3. Usar en cualquier componente:
```tsx
<Icon name="new-icon" />
```

## Notas

- Todos los iconos son de Font Awesome Solid (gratuitos)
- El componente maneja automáticamente iconos no encontrados mostrando el icono de `box` por defecto
- Los iconos se escalan automáticamente con el tamaño del texto a menos que se especifique un tamaño
