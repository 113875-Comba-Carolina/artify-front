import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ProductosComponent } from './productos/productos';
import { ProductosCategoriaComponent } from './productos-categoria/productos-categoria';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle';
import { CarritoComponent } from './carrito/carrito';
import { ExplorarProductosComponent } from './explorar-productos/explorar-productos';
import { PerfilComponent } from './perfil/perfil';
import { PagoExitosoComponent } from './pago-exitoso/pago-exitoso';
import { PagoFallidoComponent } from './pago-fallido/pago-fallido';
import { PagoPendienteComponent } from './pago-pendiente/pago-pendiente';
import { MisOrdenesComponent } from './mis-ordenes/mis-ordenes';
import { MisVentasComponent } from './mis-ventas/mis-ventas';
import { AdminReportesComponent } from './admin-reportes/admin-reportes';
import { TerminosCondicionesComponent } from './terminos-condiciones/terminos-condiciones';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'productos',
    component: ProductosComponent
  },
  {
    path: 'categoria/:categoria',
    component: ProductosCategoriaComponent
  },
  {
    path: 'explorar-productos',
    component: ExplorarProductosComponent
  },
  {
    path: 'producto/:id',
    component: ProductoDetalleComponent
  },
  {
    path: 'carrito',
    component: CarritoComponent
  },
  {
    path: 'perfil',
    component: PerfilComponent
  },
  {
    path: 'pago-exitoso',
    component: PagoExitosoComponent
  },
  {
    path: 'pago-fallido',
    component: PagoFallidoComponent
  },
  {
    path: 'pago-pendiente',
    component: PagoPendienteComponent
  },
  {
    path: 'mis-ordenes',
    component: MisOrdenesComponent
  },
  {
    path: 'mis-ventas',
    component: MisVentasComponent
  },
  {
    path: 'admin-reportes',
    component: AdminReportesComponent
  },
  {
    path: 'terminos-condiciones',
    component: TerminosCondicionesComponent
  }
];