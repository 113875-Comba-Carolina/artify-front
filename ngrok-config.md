# Configuración de ngrok para Mercado Pago

## URLs de Redirección

Una vez que tengas ngrok corriendo, actualiza estas URLs en tu código:

### 1. En carrito.ts (líneas 93-95):
```typescript
successUrl: `https://TU_URL_NGROK.ngrok.io/mis-ordenes`,
failureUrl: `https://TU_URL_NGROK.ngrok.io/pago-fallido`,
pendingUrl: `https://TU_URL_NGROK.ngrok.io/pago-pendiente`,
```

### 2. En Mercado Pago Dashboard:
- Ve a https://www.mercadopago.com.ar/developers/panel/app
- En "URLs de notificación" configura:
  - Success: `https://TU_URL_NGROK.ngrok.io/mis-ordenes`
  - Failure: `https://TU_URL_NGROK.ngrok.io/pago-fallido`
  - Pending: `https://TU_URL_NGROK.ngrok.io/pago-pendiente`

## Comandos útiles de ngrok:

```bash
# Iniciar ngrok en puerto 4200
ngrok http 4200

# Ver estadísticas en tiempo real
# Abre http://localhost:4040 en tu navegador

# Ver logs
ngrok http 4200 --log=stdout
```

## Notas importantes:

1. **ngrok gratuito**: La URL cambia cada vez que reinicias ngrok
2. **ngrok pro**: Mantiene la misma URL (recomendado para desarrollo)
3. **HTTPS**: ngrok siempre usa HTTPS, que es requerido por Mercado Pago
4. **Puerto**: Asegúrate de que Angular esté corriendo en puerto 4200
