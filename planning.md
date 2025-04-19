🎯 Fase 0: Preparación (Día 1)
Objetivo: Tener todo listo para empezar a codificar.

    Crear cuentas gratuitas:
    Render (Backend)                    https://dashboard.render.com/web/srv-cvrrbok9c44c73d974rg
    Vercel (Frontend)                   https://vercel.com/lorcana-onlines-projects/lorcanonline
    MongoDB Atlas (Base de datos)       https://cloud.mongodb.com/
    GitHub (Para alojar el código)      https://github.com/Lorcanonline/lorcanonline

    Instalar herramientas locales:
    Node.js
    Git


🎯 Fase 1: Backend Básico (Días 2-3)
Objetivo: Tener un servidor Node.js funcionando con autenticación básica.

    Estructura inicial del backend
    Archivo principal (server.js):
    Subir a GitHub y desplegar en Render:
    Conectar a Render


🎯 Fase 2: Frontend Básico (Días 4-5)
Objetivo: Tener una interfaz React inicial conectada al backend.

    Crear app React
    Conexión al backend:
    Desplegar en Vercel:
        Sube cambios a GitHub.
        Ve a Vercel > New Project > Importa lorcana-webapp/frontend.
        Configura el entorno automáticamente.


🎯 Fase 4: Sistema de Mazos (Días 8-10)
Objetivo: Permitir crear/ver mazos con todas las cartas disponibles.

    Modelo de Mazo (/backend/models/Deck.js):
        const deckSchema = new mongoose.Schema({
        name: String,
        cards: [{ 
            cardId: String,  // Usaremos tu Unique_ID
            quantity: Number 
        }]
        });

    Buscador de Cartas en Frontend:
    Usa tu JSON de cartas como un archivo estático (frontend/src/data/cards.json).
    Filtra por color, tipo, coste, etc.


🎯 Fase 5: Partidas en Tiempo Real (Días 11-14)
Objetivo: Salas privadas con WebSockets.
    Eventos WebSocket (en backend/server.js):
        io.on('connection', (socket) => {
        socket.on('join_game', (gameId) => {
            socket.join(gameId);
        });
        
        socket.on('play_card', (data) => {
            io.to(data.gameId).emit('card_played', data.card);
        });
        });

    Tablero de Juego en React:
        Componente GameBoard.js que escucha eventos WebSocket.


📅 Cronograma Resumido
Día	    Objetivo	                        Entregable
1	    Setup cuentas y repositorio	        GitHub listo
2-3	    Backend en Render + MongoDB	        API básica funcionando
4-5	    Frontend en Vercel	                Interfaz inicial
6-7	    Autenticación	                    Login/Registro funcional
8-10	Sistema de mazos	                Creador de mazos usable
11-14	Partidas en tiempo real	            Juego básico funcional