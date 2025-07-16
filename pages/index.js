import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Lucidda Tattoo - Tatuajes en Jujuy, Argentina</title>
        <meta name="description" content="Estudio de tatuajes profesional en Jujuy, Argentina. Reserva tu cita online." />
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <div className="relative bg-black text-white">
          <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Lucidda Tattoo
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-300">
                Estudio de Tatuajes Profesional en Jujuy, Argentina
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Link
                  href="/galeria"
                  className="inline-block bg-white text-black px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  Ver Galería
                </Link>
                <Link
                  href="/contacto"
                  className="inline-block border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-black transition-colors"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Servicios
              </h2>
              <p className="text-lg text-gray-600">
                Especializada en tatuajes únicos y personalizados
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Diseños Personalizados</h3>
                <p className="text-gray-600">Creamos diseños únicos adaptados a tu estilo y preferencias</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-2">Técnicas Avanzadas</h3>
                <p className="text-gray-600">Utilizamos las mejores técnicas y equipos profesionales</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold mb-2">Máxima Higiene</h3>
                <p className="text-gray-600">Estrictos protocolos de limpieza y esterilización</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Listos para tu próximo tatuaje?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              El proceso de reserva es simple y rápido. Te enviaremos un link personalizado para que elijas tu horario.
            </p>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Proceso de Reserva</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                  <p><strong>Contacta</strong><br/>Envía un mensaje por WhatsApp o Instagram</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                  <p><strong>Recibe tu Link</strong><br/>Te enviamos un enlace personalizado para reservar</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                  <p><strong>Elige tu Horario</strong><br/>Selecciona fecha y hora que mejor te convenga</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Access */}
        <div className="py-8 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Acceso Administrador
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Lucidda Tattoo</h3>
                <p className="text-gray-400">
                  Estudio profesional de tatuajes en Jujuy, Argentina.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                <p className="text-gray-400">Jujuy, Argentina</p>
                <p className="text-gray-400">WhatsApp: +54 9 XXX XXX XXXX</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
                <div className="space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                  <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; 2024 Lucidda Tattoo. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
