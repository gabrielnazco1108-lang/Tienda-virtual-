const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'unitec-sistema-secreto',
    resave: false,
    saveUninitialized: true
}));

const estilosDiseño = `
<style>
    :root {
        --bg-principal: #09090b;
        --bg-tarjeta: #141416;
        --bg-input: #1d1d21;
        --texto-blanco: #f4f4f5;
        --texto-secundario: #a1a1aa;
        --color-ingreso: #10b981;
        --color-gasto: #ef4444;
        --color-acento: #3b82f6;
        --color-gradiente: linear-gradient(135deg, #3b82f6, #ec4899, #f59e0b);
    }

    body {
        background-color: var(--bg-principal);
        color: var(--texto-blanco);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        margin: 0;
        padding: 40px 20px;
        display: flex;
        justify-content: center;
    }

    .contenedor-principal {
        width: 100%;
        max-width: 900px;
    }

    .contenedor-login {
        background-color: var(--bg-tarjeta);
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        width: 360px;
        margin: 100px auto;
        box-sizing: border-box;
    }

    .titulo-gradiente {
        font-size: 28px;
        font-weight: 800;
        margin: 0 0 8px 0;
        background: var(--color-gradiente);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
    }

    .subtitulo {
        color: var(--texto-secundario);
        font-size: 14px;
        text-align: center;
        margin: 0 0 30px 0;
    }

    .grid-panel {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-top: 20px;
    }

    @media (max-width: 768px) {
        .grid-panel { grid-template-columns: 1fr; }
    }

    .tarjeta {
        background-color: var(--bg-tarjeta);
        padding: 24px;
        border-radius: 14px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .tarjeta-completa {
        grid-column: 1 / -1;
    }

    .tarjeta h3 {
        margin-top: 0;
        font-size: 18px;
        border-bottom: 1px solid #27272a;
        padding-bottom: 10px;
        color: var(--texto-blanco);
    }

    .resumen-balance {
        display: flex;
        justify-content: space-around;
        text-align: center;
        margin-bottom: 25px;
        background: #18181b;
        padding: 20px;
        border-radius: 12px;
    }

    .balance-item h4 { margin: 0; font-size: 13px; color: var(--texto-secundario); }
    .balance-item p { margin: 5px 0 0 0; font-size: 20px; font-weight: 700; }

    .campo { margin-bottom: 15px; }
    label { display: block; font-size: 13px; color: var(--texto-secundario); margin-bottom: 5px; }
    
    input, select, textarea {
        width: 100%;
        padding: 10px;
        background-color: var(--bg-input);
        border: 1px solid #27272a;
        border-radius: 8px;
        color: var(--texto-blanco);
        font-size: 14px;
        box-sizing: border-box;
    }

    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--color-acento); }

    textarea { resize: vertical; font-family: inherit; }

    .btn {
        background: var(--color-gradiente);
        color: white;
        border: none;
        padding: 10px 15px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        width: 100%;
        transition: opacity 0.2s;
    }

    .btn:hover { opacity: 0.9; }

    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
    th { text-align: left; color: var(--texto-secundario); padding: 8px; border-bottom: 1px solid #27272a; }
    td { padding: 10px 8px; border-bottom: 1px solid #1f1f23; }

    .monto-ingreso { color: var(--color-ingreso); font-weight: 600; }
    .monto-gasto { color: var(--color-gasto); font-weight: 600; }

    .badge-estado {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge-alcanza { background-color: rgba(16, 185, 129, 0.2); color: var(--color-ingreso); }
    .badge-falta { background-color: rgba(239, 68, 68, 0.2); color: var(--color-gasto); }

    .enlace-salir {
        display: inline-block;
        color: var(--texto-secundario);
        text-decoration: none;
        font-size: 14px;
    }
    .enlace-salir:hover { color: #ef4444; }
</style>
`;

app.get('/', (req, res) => {
    if (req.session.usuario) {
        if (!req.session.transacciones) req.session.transacciones = [];
        if (!req.session.listaDeseos) req.session.listaDeseos = [];

        let totalIngresos = 0;
        let totalGastos = 0;

        req.session.transacciones.forEach(t => {
            if (t.tipo === 'ingreso') totalIngresos += parseFloat(t.monto);
            if (t.tipo === 'gasto') totalGastos += parseFloat(t.monto);
        });

        let saldoRestante = totalIngresos - totalGastos;

        let transaccionesHtml = req.session.transacciones.map(t => `
            <tr>
                <td>${t.descripcion}</td>
                <td><span class="badge-estado" style="background: #27272a; color: var(--texto-secundario);">${t.categoria}</span></td>
                <td><span class="badge-estado" style="background: #1e1e24; color: #a1a1aa;">${t.frecuencia}</span></td>
                <td class="${t.tipo === 'ingreso' ? 'monto-ingreso' : 'monto-gasto'}">
                    ${t.tipo === 'ingreso' ? '+' : '-'}$${parseFloat(t.monto).toFixed(2)}
                </td>
            </tr>
        `).join('');

        let deseosHtml = req.session.listaDeseos.map(d => {
            const precio = parseFloat(d.precio);
            const alcanza = saldoRestante >= precio;
            const diferencia = precio - saldoRestante;

            return `
                <tr>
                    <td><b>${d.nombre}</b></td>
                    <td>$${precio.toFixed(2)}</td>
                    <td>
                        ${alcanza 
                            ? '<span class="badge-estado badge-alcanza">¡Te alcanza!</span>' 
                            : `<span class="badge-estado badge-falta">Faltan $${diferencia.toFixed(2)}</span>`}
                    </td>
                </tr>
            `;
        }).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Unitec Informática - Control Financiero</title>
                ${estilosDiseño}
            </head>
            <body>
                <div class="contenedor-principal">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h1 class="titulo-gradiente" style="text-align: left; margin: 0;">Unitec informática</h1>
                            <p style="color: var(--texto-secundario); margin: 5px 0 0 0;">Gestión Unificada de Finanzas y Deseos</p>
                        </div>
                        <a href="/logout" class="enlace-salir">Cerrar Sesión (${req.session.usuario})</a>
                    </div>

                    <div class="resumen-balance">
                        <div class="balance-item">
                            <h4>Total Ingresos</h4>
                            <p style="color: var(--color-ingreso);">$${totalIngresos.toFixed(2)}</p>
                        </div>
                        <div class="balance-item">
                            <h4>Gastos y Servicios</h4>
                            <p style="color: var(--color-gasto);">$${totalGastos.toFixed(2)}</p>
                        </div>
                        <div class="balance-item">
                            <h4>Saldo Restante (Ahorro)</h4>
                            <p style="color: var(--texto-blanco); font-size: 22px; border-bottom: 2px solid var(--color-acento);">$${saldoRestante.toFixed(2)}</p>
                        </div>
                    </div>

                    <div class="grid-panel">
                        <div class="tarjeta">
                            <h3>Registrar Movimiento</h3>
                            <form action="/transaccion" method="POST">
                                <div class="campo">
                                    <label>Descripción</label>
                                    <input type="text" name="descripcion" placeholder="Ej. Luz, Internet, Sueldo" required autocomplete="off">
                                </div>
                                <div class="campo">
                                    <label>Monto</label>
                                    <input type="number" step="0.01" name="monto" placeholder="0.00" required>
                                </div>
                                <div class="campo">
                                    <label>Tipo</label>
                                    <select name="tipo">
                                        <option value="ingreso">Ingreso</option>
                                        <option value="gasto">Gasto / Servicio</option>
                                    </select>
                                </div>
                                <div class="campo">
                                    <label>Frecuencia</label>
                                    <select name="frecuencia">
                                        <option value="Mensual">Mensual</option>
                                        <option value="Semanal">Semanal</option>
                                    </select>
                                </div>
                                <div class="campo">
                                    <label>Categoría</label>
                                    <input type="text" name="categoria" placeholder="Ej. Hogar, Sueldo, Ocio" required autocomplete="off">
                                </div>
                                <button type="submit" class="btn">Guardar</button>
                            </form>
                        </div>

                        <div class="tarjeta">
                            <h3>Añadir Deseo / Meta</h3>
                            <form action="/deseo" method="POST">
                                <div class="campo">
                                    <label>Artículo o Meta</label>
                                    <input type="text" name="nombre" placeholder="¿Qué quieres comprar?" required autocomplete="off">
                                </div>
                                <div class="campo">
                                    <label>Precio Estimado</label>
                                    <input type="number" step="0.01" name="precio" placeholder="0.00" required>
                                </div>
                                <button type="submit" class="btn" style="background: linear-gradient(135deg, #ec4899, #f59e0b);">Añadir a la Lista</button>
                            </form>
                        </div>

                        <div class="tarjeta tarjeta-completa">
                            <h3>Historial Financiero</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Descripción</th>
                                        <th>Categoría</th>
                                        <th>Frecuencia</th>
                                        <th>Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transaccionesHtml || '<tr><td colspan="4" style="text-align: center; color: var(--texto-secundario);">No hay movimientos registrados.</td></tr>'}
                                </tbody>
                            </table>
                        </div>

                        <div class="tarjeta tarjeta-completa">
                            <h3>Control Inteligente de Deseos (Basado en tu Ahorro)</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Deseo</th>
                                        <th>Precio</th>
                                        <th>Estado Actual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${deseosHtml || '<tr><td colspan="3" style="text-align: center; color: var(--texto-secundario);">No hay deseos guardados.</td></tr>'}
                                </tbody>
                            </table>
                        </div>

                        <div class="tarjeta tarjeta-completa">
                            <h3>Soporte Técnico - Reportar Incidencia</h3>
                            <form action="/reportar" method="POST">
                                <div class="campo">
                                    <label>Asunto del Problema</label>
                                    <input type="text" name="asunto" placeholder="Ej. Error al guardar, No carga la tabla..." required autocomplete="off">
                                </div>
                                <div class="campo">
                                    <label>Descripción detallada de la falla</label>
                                    <textarea name="mensaje" rows="3" placeholder="Explica qué es lo que no está funcionando bien..." required></textarea>
                                </div>
                                <button type="submit" class="btn" style="background: #27272a; color: var(--texto-blanco);">Enviar Reporte de Falla</button>
                            </form>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Iniciar Sesión - Unitec</title>
                ${estilosDiseño}
            </head>
            <body>
                <div class="contenedor-login">
                    <h1 class="titulo-gradiente">Unitec informática</h1>
                    <p class="subtitulo">Inicia sesión obligatoria para gestionar tu dinero</p>
                    <form action="/login" method="POST">
                        <div class="campo">
                            <label>Usuario</label>
                            <input type="text" name="username" placeholder="Ingresa cualquier usuario" required autocomplete="off">
                        </div>
                        <div class="campo">
                            <label>Contraseña</label>
                            <input type="password" name="password" placeholder="Ingresa cualquier contraseña" required>
                        </div>
                        <button type="submit" class="btn">Entrar al Sistema</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username.trim() !== "" && password.trim() !== "") {
        req.session.usuario = username;
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});

app.post('/transaccion', (req, res) => {
    if (req.session.usuario) {
        const { descripcion, monto, tipo, frecuencia, categoria } = req.body;
        req.session.transacciones.push({
            descripcion,
            monto: parseFloat(monto),
            tipo,
            frecuencia,
            categoria
        });
    }
    res.redirect('/');
});

app.post('/deseo', (req, res) => {
    if (req.session.usuario) {
        const { nombre, precio } = req.body;
        req.session.listaDeseos.push({
            nombre,
            precio: parseFloat(precio)
        });
    }
    res.redirect('/');
});

// Ruta para manejar el reporte de soporte enviado
app.post('/reportar', (req, res) => {
    if (req.session.usuario) {
        // En una app real aquí se guardaría en BD o enviaría correo electrónico.
        console.log(`[SOPORTE] Reporte de ${req.session.usuario}: ${req.body.asunto} - ${req.body.mensaje}`);
    }
    res.send(`
        <script>
            alert('Reporte enviado con éxito al departamento de soporte técnico.');
            window.location.href = '/';
        </script>
    `);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Servidor financiero activo en: http://localhost:3000');
});