import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  // Confirmación para eliminación
  async confirmDelete(title: string, text: string = 'Esta acción no se puede deshacer'): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    return result.isConfirmed;
  }

  // Confirmación para desactivar
  async confirmDeactivate(title: string, text: string = 'El producto no será visible para los clientes'): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    return result.isConfirmed;
  }

  // Confirmación para activar
  async confirmActivate(title: string, text: string = 'El producto será visible para los clientes'): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    return result.isConfirmed;
  }

  // Éxito
  success(title: string, text: string = ''): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Entendido'
    });
  }

  // Error
  error(title: string, text: string = ''): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Entendido'
    });
  }

  // Información
  info(title: string, text: string = ''): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'info',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Entendido'
    });
  }

  // Advertencia
  warning(title: string, text: string = ''): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Entendido'
    });
  }

  // Cargando
  loading(title: string = 'Cargando...'): void {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Cerrar loading
  closeLoading(): void {
    Swal.close();
  }

  // Confirmación genérica
  async confirm(title: string, text: string = ''): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });
    return result.isConfirmed;
  }

  // Confirmación personalizada
  async confirmCustom(
    title: string, 
    text: string, 
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar',
    icon: 'warning' | 'question' | 'info' | 'success' | 'error' = 'question',
    confirmColor: string = '#3b82f6'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    });
    return result.isConfirmed;
  }
}
