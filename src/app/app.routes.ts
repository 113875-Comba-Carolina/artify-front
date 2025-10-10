import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ProductosComponent } from './productos/productos';
import { ProductosCategoriaComponent } from './productos-categoria/productos-categoria';
import { ProductoDetalleComponent } from './producto-detalle/producto-detalle';
import { CarritoComponent } from './carrito/carrito';
import { ExplorarProductosComponent } from './explorar-productos/explorar-productos';
import { PerfilComponent } from './perfil/perfil';

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
  }
];