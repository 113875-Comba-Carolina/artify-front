import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-faq-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-modal.component.html',
  styleUrls: ['./faq-modal.component.scss']
})
export class FaqModalComponent {
  @Output() close = new EventEmitter<void>();

  selectedCategory = 'general';
  openItems: Set<number> = new Set();

  categories = [
    { id: 'general', name: 'General', icon: '🏠' },
    { id: 'compras', name: 'Compras', icon: '🛒' },
    { id: 'ventas', name: 'Ventas', icon: '🎨' },
    { id: 'pagos', name: 'Pagos', icon: '💳' },
    { id: 'envios', name: 'Envíos', icon: '📦' }
  ];

  faqItems: FAQItem[] = [
    // General
    {
      question: '¿Qué es Artify?',
      answer: 'Artify es un marketplace especializado en artesanías únicas y hechas a mano. Conectamos artesanos talentosos con compradores que valoran la autenticidad y la creatividad de productos artesanales.',
      category: 'general'
    },
    {
      question: '¿Cómo puedo registrarme en Artify?',
      answer: 'Puedes registrarte como comprador o como artesano. Simplemente haz clic en "Registrarse" en la parte superior de la página, selecciona tu tipo de cuenta y completa el formulario con tus datos.',
      category: 'general'
    },
    {
      question: '¿Es gratis usar Artify?',
      answer: 'Sí, registrarse y navegar por Artify es completamente gratuito. Los artesanos pueden vender sus productos sin costo de suscripción, y los compradores pueden explorar y comprar sin tarifas adicionales.',
      category: 'general'
    },
    {
      question: '¿Cómo puedo contactar al soporte?',
      answer: 'Puedes contactarnos por email a contacto@artify.com o por teléfono al (123) 456-789.',
      category: 'general'
    },

    // Compras
    {
      question: '¿Cómo puedo comprar un producto?',
      answer: 'Navega por las categorías o usa la búsqueda para encontrar productos que te gusten. Haz clic en un producto para ver detalles, selecciona la cantidad y haz clic en "Agregar al carrito". Luego procede al checkout para completar tu compra.',
      category: 'compras'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos pagos a través de Mercado Pago, que incluye tarjetas de crédito y débito, transferencias bancarias, y billeteras digitales. Todos los pagos son procesados de forma segura.',
      category: 'compras'
    },
    {
      question: '¿Puedo cancelar mi pedido?',
      answer: 'Sí, puedes cancelar tu pedido si aún no ha sido enviado. Contacta directamente al artesano. Los reembolsos se procesan según la política de cada artesano.',
      category: 'compras'
    },

    // Ventas
    {
      question: '¿Cómo puedo vender mis productos en Artify?',
      answer: 'Regístrate como artesano, completa tu perfil con información sobre tu emprendimiento, y comienza a subir fotos de tus productos.',
      category: 'ventas'
    },
    {
      question: '¿Qué tipos de productos puedo vender?',
      answer: 'Solo podes vender productos artesanales únicos y hechos a mano. Esto incluye cerámica, textiles, joyería, esculturas, pinturas, muebles artesanales, y cualquier creación original que refleje tu talento artístico.',
      category: 'ventas'
    },
    {
      question: '¿Cómo establezco los precios de mis productos?',
      answer: 'Tú decides el precio de tus productos. Considera el costo de materiales, tiempo de trabajo, y valor artístico. Te recomendamos investigar precios similares en el mercado para mantener competitividad.',
      category: 'ventas'
    },

    // Pagos
    {
      question: '¿Es seguro pagar en Artify?',
      answer: 'Sí, utilizamos Mercado Pago como procesador de pagos, que cumple con los más altos estándares de seguridad. Tus datos financieros están protegidos con encriptación SSL y nunca son almacenados en nuestros servidores.',
      category: 'pagos'
    },
    {
      question: '¿Puedo pagar en cuotas?',
      answer: 'Sí, dependiendo de tu tarjeta y el monto de la compra, Mercado Pago ofrece opciones de pago en cuotas sin interés o con interés. Las opciones disponibles se muestran durante el proceso de pago.',
      category: 'pagos'
    },
    {
      question: '¿Qué pasa si mi pago es rechazado?',
      answer: 'Si tu pago es rechazado, verifica que los datos de tu tarjeta sean correctos y que tengas fondos suficientes. También puedes intentar con otro método de pago disponible en Mercado Pago.',
      category: 'pagos'
    },

    // Envíos
    {
      question: '¿Cuánto cuesta el envío?',
      answer: 'Los costos de envío varían según la ubicación, el modo de envío y el peso/tamaño del producto.',
      category: 'envios'
    },
    {
      question: '¿Cuánto tiempo tarda en llegar mi pedido?',
      answer: 'Los tiempos de entrega dependen del artesano y la ubicación. Generalmente, los productos artesanales tardan entre 3-7 días hábiles en ser preparados, más el tiempo de envío según la distancia.',
      category: 'envios'
    },
    {
      question: '¿Hacen envíos a todo el país?',
      answer: 'Sí, la mayoría de nuestros artesanos hacen envíos a todo el país. Sin embargo, algunos productos frágiles o de gran tamaño pueden tener restricciones. Esto se indica claramente en la descripción del producto.',
      category: 'envios'
    },
    {
      question: '¿Qué pasa si mi producto llega dañado?',
      answer: 'Si tu producto llega dañado, contacta inmediatamente al artesano y a nuestro soporte. Tomaremos fotos del daño y trabajaremos para resolver el problema, ya sea con un reemplazo o reembolso.',
      category: 'envios'
    }
  ];

  get filteredItems(): FAQItem[] {
    return this.faqItems.filter(item => item.category === this.selectedCategory);
  }

  toggleItem(index: number) {
    if (this.openItems.has(index)) {
      this.openItems.delete(index);
    } else {
      this.openItems.add(index);
    }
  }

  isItemOpen(index: number): boolean {
    return this.openItems.has(index);
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.openItems.clear();
  }

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
